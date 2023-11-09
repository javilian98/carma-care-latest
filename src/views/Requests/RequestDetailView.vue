<script setup>
import { ref, onMounted, computed } from 'vue'

import { supabase } from '../../lib/supabase'

import { Arrow, Sync } from '@egjs/flicking-plugins'

import Avatar from 'primevue/avatar/Avatar.vue'
import Button from 'primevue/button/Button.vue'
import Image from 'primevue/image/Image.vue'
import Flicking from '@egjs/vue3-flicking'
import Tag from 'primevue/tag/Tag.vue'

import CardContainer from '../../components/CardContainer/CardContainer.vue'
import Map from '../../components/Map.vue'

import {
  LISTING_TYPE,
  DIETARY_RESTRICTIONS,
  FOOD_ALLERGENS,
  STATUS,
  SERVING_SIZE,
  CATEGORY
} from '../../util/constants'

import { useRoute } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useChatStore } from '../../stores/chat'
import { useToast, POSITION } from 'vue-toastification'
import router from '../../router'
import { REALTIME_POSTGRES_CHANGES_LISTEN_EVENT } from '@supabase/supabase-js'

const route = useRoute()
const user = useUserStore()
const chat = useChatStore()
const toast = useToast()

const bgOverlay = ref('')
const flickingPlugins = ref([])
const flickingMainImage = ref()
const flickingImageCarousel = ref()

const form = ref({
  posterID: '',
  username: '',
  handle: '',
  userAllergies: '',
  listingType: '', // (LISTING_TYPE.Request for CreateEditRequestView.vue)
  listingTitle: '',
  status: '',
  category: '',
  dietaryRestrictions: DIETARY_RESTRICTIONS.None,
  foodAllergens: FOOD_ALLERGENS.None,
  tags: [],
  description: '',
  images: [],
  quantityNum: '',
  locationAddress: '',
  locationDescription: '',
  locationCoords: ''
})

const renderTextContent = (value) => {
  return value === '' || value === null ? '-' : value
}

onMounted(() => {
  getGiveawayDetailData()
  imageCarouselSetup()
})

const getGiveawayDetailData = async () => {
  const { data, error } = await supabase
    .from('listings')
    .select(
      'poster_id,listingID,listingType, listingDesc, postingTime, locationAddress, locationDesc, locationCoords, category, dietaryRestrictions, allergens, images, listingTitle, tags,status, quantityNum, userProfiles(username, avatarUrl, handle, allergies)'
    )
    .match({ listingID: route.params.id })
    .single()

  // : avatarUrl = item.avatarUrl

  if (error) {
    console.log('error: ', error)
    // handle the error
  } else {
    // do something with the data (e.g. assign data to an array ref)
    // queryData.value = data
    form.value = {
      posterID: data.poster_id,
      username: data.userProfiles.username,
      handle: data.userProfiles.handle,
      avatarUrl: data.userProfiles.avatarUrl,
      userAllergies: data.userProfiles.allergies,
      listingType: data.listingType, // (LISTING_TYPE.Request for CreateEditRequestView.vue)
      listingTitle: data.listingTitle,
      status: data.status,
      category: data.category,
      dietaryRestrictions: data.dietaryRestrictions || null,
      foodAllergens: data.allergens || [],
      tags: data.tags || [],
      description: data.listingDesc || '',
      images: data.images || [],
      quantityNum: data.quantityNum || '',
      locationAddress: data.locationAddress || '',
      locationDescription: data.locationDesc || '',
      locationCoords: JSON.parse(data.locationCoords) || ''
    }

    bgOverlay.value = data.images[0]

    console.log('giveaway detail data: ', form.value)
  }
}

const imageCarouselSetup = () => {
  flickingPlugins.value = [
    new Arrow(),
    new Sync({
      //   type: 'camera',
      synchronizedFlickingOptions: [
        {
          flicking: flickingMainImage.value
          //   isClickable: true
        },
        {
          flicking: flickingImageCarousel.value,
          //   isClickable: true,
          activeClass: 'active'
        }
      ]
    })
  ]
}

const handleChatWithUser = async () => {
  console.log('CLICKEDD')
  // Check if message to user exists
  const { data: chatMessages, error: chatMessageError } = await supabase
    .from('chatMessages')
    .select('*')
    .match({
      sender_id: user.profile.id,
      recipient_id: form.value.posterID
    })

  if (chatMessageError) {
    console.log('chatMessageError: ', chatMessageError)
  } else {
    console.log('ELSE PART ', chatMessages)
    if (chatMessages.length === 0) {
      const { data: posterIdUserData, error: posterIdUserDataError } = await supabase
        .from('userProfiles')
        .select('*')
        .match({
          id: form.value.posterID
        })

      if (posterIdUserDataError) {
        console.log('posterIdUserDataError: ', posterIdUserDataError)
      } else {
        chat.selectedContact = posterIdUserData

        console.log('chat.selectedContact ', chat.selectedContact)

        var chat_message = ''
        if (form.value.listingType == 'Giveaway') {
          chat_message = 'Hello, I am interested in your Giveaway!'
        } else {
          chat_message = 'Hello, I am interested in your Request!'
        }

        const message = {
          sender_id: user.currentUser.id,
          recipient_id: form.value.posterID,
          listing_id: route.params.id,
          message: chat_message
        }

        // Insert into supabase
        const { error } = await supabase.from('chatMessages').insert(message)

        if (error) {
          console.log('create profile: ', error)
          toast.error(error.message, {
            position: POSITION.TOP_CENTER,
            timeout: 2000
          })
          return
        }

        console.log('SUCCESS')
      }
    }

    router.push({ name: 'Chatroom' })
  }
}
</script>

<template>
  <main class="giveaway-detail">
    <section class="giveaway-detail-top">
      <div class="giveaway-main-image">
        <!-- <img src="https://drivemehungry.com/wp-content/uploads/2020/11/IMG_8970.jpg" alt="" /> -->
        <Flicking
          ref="flickingMainImage"
          :options="{ align: 'prev', circular: false, panelsPerView: 1 }"
          style="height: 350px"
        >
          <div v-for="(image, index) in form.images" :key="index">
            <Image :key="index" :src="image" alt="1" preview />
          </div>
          <template #viewport>
            <span class="flicking-arrow-prev"></span>
            <span class="flicking-arrow-next"></span>
          </template>
        </Flicking>
      </div>
      <div class="giveaway-detail-top-content">
        <h1 class="giveaway-title">{{ form.listingTitle }}</h1>
        <Button
          v-if="form.posterID !== user.currentUser?.id"
          @click="handleChatWithUser"
          class="giveaway-cta-btn"
          icon="pi pi-comments"
          label="Chat Now"
          style="
            padding: 0.75em 2.25em;
            width: fit-content;
            /* background: white;
            color: var(--color-primary); */
            background: var(--color-primary);
            color: white;
            border: solid 1px transparent;
          "
          rounded
        />

        <router-link :to="{ path: `/requests/edit/${route.params.id}` }">
          <Button
            v-if="form.posterID == user.currentUser?.id"
            class="giveaway-cta-btn"
            icon="pi pi-file-edit"
            label="Edit Listing"
            style="
              padding: 0.75em 2.25em;
              width: fit-content;
              /* background: white;
              color: var(--color-primary); */
              background: white;
              color: var(--color-primary);
              border: solid 1px transparent;
            "
            rounded
          />
        </router-link>
        <div class="giveaway-image-carousel">
          <Flicking
            class="giveaway-image-carousel-container"
            ref="flickingImageCarousel"
            :options="{
              align: 'prev',
              circular: false,
              panelsPerView: 3
              //   bound: true
            }"
            :plugins="flickingPlugins"
          >
            <Image
              v-for="(image, index) in form.images"
              :key="index"
              style="padding: 10px"
              :src="image"
              alt="1"
              preview
            />
            <template #viewport>
              <span class="flicking-arrow-prev"></span>
              <span class="flicking-arrow-next"></span>
            </template>
          </Flicking>
        </div>
      </div>
      <div class="bg-overlay" :style="{ '--bg-image': `url(${bgOverlay})` }"></div>
    </section>
    <section class="giveaway-detail-bottom">
      <CardContainer class="giveaway-detail-bottom-card" :title="form.listingType + ' Information'">
        <div class="giveaway-information">
          <div class="giveaway-item giveaway-title">
            <span class="giveaway-item-label">{{ form.listingType }} Title</span>
            <span class="giveaway-item-value">{{ form.listingTitle }}</span>
          </div>
          <div v-if='form.category == CATEGORY.Food' class="giveaway-item giveaway-diet">
            <span class="giveaway-item-label">Dietary Restriction</span>
            <span class="giveaway-item-value">{{
              renderTextContent(form.dietaryRestrictions)
            }}</span>
          </div>
          <div v-if='form.category == CATEGORY.Food' class="giveaway-item giveaway-serving">
            <span class="giveaway-item-label">Serving Size</span>
            <span class="giveaway-item-value">{{ form.quantityNum }} Serving(s)</span>
          </div>
          <div v-if='form.category == CATEGORY.Food' class="giveaway-item giveaway-tags">
            <span class="giveaway-item-label">Main Ingredients</span>
            <span class="giveaway-item-value">
              <Tag
                v-for="(tag, index) in form.tags"
                :key="index"
                severity="warning"
                :value="tag"
                rounded
              />
            </span>
          </div>
          <div v-if='form.category == CATEGORY.Food' class="giveaway-item giveaway-allergens">
            <span class="giveaway-item-label">Food Allergens</span>
            <span class="giveaway-item-value">
              <Tag
                v-for="(allergen, index) in form.foodAllergens"
                :key="index"
                severity="danger"
                :value="allergen"
                rounded
              />
            </span>
          </div>
          <div class="giveaway-item giveaway-description">
            <span class="giveaway-item-label">Description</span>
            <span class="giveaway-item-value">{{ renderTextContent(form.description) }}</span>
          </div>
        </div>

        <hr />
        <h2>Location Information</h2>
        <div class="location-information">
          <div class="giveaway-item">
            <span class="giveaway-item-label">Location Name</span>
            <span class="giveaway-item-value">{{ renderTextContent(form.locationAddress) }}</span>
          </div>
          <div class="giveaway-item">
            <span class="giveaway-item-label">Location Description</span>
            <span class="giveaway-item-value">{{
              renderTextContent(form.locationDescription)
            }}</span>
          </div>
          <div class="giveaway-item giveaway-estimated-time">
            <span class="giveaway-item-label">Estimated Arrival Time</span>
            <span class="giveaway-item-value">
              <div class="giveaway-item-time-container">
                <div class="giveaway-item-time">
                  <span>20min</span>
                  <span>Car</span>
                </div>
                <div class="giveaway-item-time">
                  <span>20min</span>
                  <span>Bus/Train</span>
                </div>
                <div class="giveaway-item-time">
                  <span>20min</span>
                  <span>Walk</span>
                </div>
              </div>
              <div class="giveaway-item-time-distance">14km away from your location</div>
            </span>
            <!-- <div class="map">Embed Google Maps API</div> -->
            <Map :locationCoords="form.locationCoords" />
          </div>
        </div>

        <hr />
        <h2 v-if="form.listingType == 'Giveaway'">Giver Information</h2>
        <h2 v-else>Requester Information</h2>
        <div class="giver-information">
          <Avatar
            v-if="form.avatarUrl != null"
            :image="form.avatarUrl"
            shape="circle"
            style="height: 180px; width: 180px"
          />
          <Avatar
            v-else
            :label="form.username?.[0]?.toUpperCase()"
            shape="circle"
            size="xlarge"
            style="
              height: 180px;
              width: 180px;
              background-color: rgb(76, 175, 79);
              color: white;
              font-size: 50px;
            "
          />

          <!-- <Avatar label="P" shape="circle" style="height: 180px; width: 180px" /> -->
          <div class="giver-information-content">
            <router-link
              :to="{ path: `/profile/@${form.handle}` }"
              style="color: var(--color-primary)"
            >
              <h3>{{ form.username }}</h3>
            </router-link>

            <div v-if="form.userAllergies" class="food-allergens-container">
              <p>Food Allergens</p>
              <div class="tags">
                <Tag
                  v-for="(allergy, index) in form.userAllergies"
                  :key="index"
                  severity="danger"
                  :value="allergy"
                  rounded
                />
              </div>
            </div>

            <Button
              v-if="form.posterID !== user.currentUser?.id"
              class="giveaway-cta-btn"
              icon="pi pi-comments"
              @click="handleChatWithUser"
              label="Chat Now"
              style="
                padding: 0.75em 2.25em;
                width: fit-content;
                /* background: white;
            color: var(--color-primary); */
                background: var(--color-primary);
                color: white;
                border: solid 1px transparent;
              "
              rounded
            />
          </div>
        </div>
      </CardContainer>
    </section>
  </main>
</template>

<style>
main.giveaway-detail {
  padding-top: 65px;
}

section.giveaway-detail-top {
  background: #efefef;
  /* padding: 40px; */
  padding-bottom: 100px;
  padding-top: 40px;
  display: flex;
  gap: 40px;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.giveaway-detail-top-content {
  max-width: 520px;
  width: 100%;
  display: flex;
  /* margin-top: 20px; */
  /* justify-content: center; */
  flex-direction: column;
  /* align-items: center; */
  z-index: 1;
}

.giveaway-main-image {
  width: 400px;
  height: 350px;
  border-radius: 25px;
  overflow: hidden;
  z-index: 1;
  transition: all 0.3s ease-in-out;
}
.giveaway-main-image:hover {
  transform: translateY(-5px);
  box-shadow: 0 7px 30px rgba(0, 0, 0, 0.15);
}

.giveaway-main-image img {
  height: 350px;
  width: inherit;
  object-fit: cover;
}
.giveaway-main-image span {
  width: inherit;
}

.giveaway-main-image .flicking-arrow-prev,
.giveaway-main-image .flicking-arrow-next {
  display: none;
}

section.giveaway-detail-top h1 {
  max-width: 520px;
  font-size: 2.5em;
  font-weight: bold;
  margin-bottom: 20px;
  /* color: white; */
  color: var(--color-primary);
  line-height: 1.25;
}
section.giveaway-detail-top .giveaway-cta-btn {
}

.giveaway-image-carousel {
  /* overflow: hidden; */
  margin-top: 50px;
}
.giveaway-image-carousel:hover {
  /* overflow: hidden; */
  margin-top: 50px;
}
.giveaway-image-carousel img {
  width: 100%;
  height: 100%;
  max-width: 150px;
  max-height: 150px;
  object-fit: cover;
  border-radius: 25px;
  box-shadow: 0 7px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease-in-out;
}

.flicking-viewport {
  height: -webkit-fill-available;
}

.giveaway-image-carousel .flicking-arrow-next,
.giveaway-image-carousel .flicking-arrow-prev {
  background: white;
  border-radius: 50%;
  scale: 0.6;
  top: 42%;
}

.giveaway-image-carousel .flicking-arrow-prev {
  left: 0 !important;
  margin-left: -12px;
}
.giveaway-image-carousel .flicking-arrow-next {
  right: 0 !important;
  margin-right: -12px;
}

.giveaway-image-carousel .p-image-preview-indicator {
  border-radius: 25px;
  scale: 0.88;
}

.giveaway-main-image .p-image-preview-container > .p-image-preview-indicator,
.giveaway-image-carousel .p-image-preview-container > .p-image-preview-indicator {
  background-color: transparent !important;
  border: solid 3px transparent;
}
.giveaway-main-image .p-image-preview-container > .p-image-preview-indicator .p-icon,
.giveaway-image-carousel .p-image-preview-container > .p-image-preview-indicator .p-icon {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
.giveaway-image-carousel .p-image-preview-container > img {
  transition: all 0.3s ease-in-out;
}
.giveaway-image-carousel .p-image-preview-container:hover > img {
  transform: translateY(-5px);
  box-shadow: 0 7px 15px rgba(0, 0, 0, 0.25);
}

.giveaway-detail-bottom {
  width: 100%;
  max-width: 750px;
  margin: 0 auto;
  margin-top: -60px;
  position: relative;
}

.giveaway-detail-bottom-card {
  margin-left: 0 !important;
}

.bg-overlay::before {
  content: '';
  background-image: linear-gradient(#ffc892, #ffffff7d), var(--bg-image);
  opacity: 0.65;
  position: absolute;
  background-attachment: scroll;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  filter: blur(20px);
  margin: -40px; /* this will do the trick */
  z-index: 0;
}

.giveaway-information,
.location-information {
  display: flex;
  flex-flow: wrap;
  gap: 20px;
}

.giveaway-detail-bottom h2 {
  margin-bottom: 30px;
}

.giveaway-information .giveaway-item {
  display: flex;
  flex-direction: column;
  flex: calc(50% - 20px);
  margin-bottom: 10px;
}

.location-information .giveaway-item {
  flex: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.giveaway-information .giveaway-description {
  flex: calc(100% - 20px);
}

.giveaway-item-label {
  color: var(--color-primary);
  margin-bottom: 10px;
  font-size: 0.9em;
}
.giveaway-item-value {
  color: #444444;
  display: flex;
  gap: 10px;
}

.giveaway-detail-bottom-card hr {
  border-top: dashed 1px var(--color-primary);
  margin: 20px 0;
}
.giveaway-detail-bottom-card h2 {
  margin: 0px 0 25px 0;
}

.giveaway-estimated-time .giveaway-item-value {
  justify-content: space-between;
}

.giveaway-item-time-container {
  display: flex;
  gap: 20px;
}

.giveaway-item-time {
  display: flex;
  flex-direction: column;
}
.giveaway-item-time-distance {
  color: var(--color-primary);
}

.giver-information {
  display: flex;
  align-items: center;
  gap: 20px;
}
.giver-information-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.food-allergens-container {
  margin-bottom: 10px;
}
.food-allergens-container p {
  font-size: 0.9em;
  margin-bottom: 10px;
}

.food-allergens-container .tags {
  display: flex;
  gap: 10px;
}

@media screen and (max-width: 950px) {
  section.giveaway-detail-top {
    flex-direction: column;
  }

  section.giveaway-detail-top {
    gap: 20px;
    padding-top: 20px;
  }

  .giveaway-detail-top-content {
    align-items: center;
    margin: 0 auto;
  }

  .giveaway-main-image {
    margin: auto;
    /* width: 90%;
    height: 400px; */
    width: 350px;
    height: 350px;
  }

  section.giveaway-detail-top h1 {
    text-align: center;
    font-size: 1.6em;
  }

  .giveaway-image-carousel {
    width: 90%;
    /* margin-top: 30px; */
  }
}

@media screen and (max-width: 520px) {
  .giver-information {
    flex-direction: column;
  }
  .giver-information-content {
    align-items: center;
  }
  .giveaway-information .giveaway-item {
    flex: 100%;
    margin-bottom: 15px;
  }
  .food-allergens-container p {
    text-align: center;
  }
  .giveaway-estimated-time .giveaway-item-value {
    flex-direction: column;
  }
}
</style>
