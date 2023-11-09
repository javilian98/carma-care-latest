<script setup>
/* eslint-disable no-undef */
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import router from '../../router'
import { useMatchMedia, screenSize } from '../../composables/useMatchMedia'

import ListingsCard from '../../components/Listings/ListingsCard.vue'
import CardContainer from '../../components/CardContainer/CardContainer.vue'
import MultipleImageUpload from '../../components/MultipleImageUpload.vue'

import Dialog from 'primevue/dialog/Dialog.vue'
import Button from 'primevue/button/Button.vue'
import InputText from 'primevue/inputtext/InputText.vue'
import Dropdown from 'primevue/dropdown/Dropdown.vue'
import MultiSelect from 'primevue/multiselect/MultiSelect.vue'
import Textarea from 'primevue/textarea/Textarea.vue'
import Chips from 'primevue/chips/Chips.vue'

import { supabase } from '../../lib/supabase'

import VueGoogleAutocomplete from 'vue-google-autocomplete'

import {
  LISTING_TYPE,
  DIETARY_RESTRICTIONS,
  FOOD_ALLERGENS,
  STATUS,
  SERVING_SIZE,
  CATEGORY
} from '../../util/constants'

import { convertConstantsToDropdownOptions } from '../../util/helper'

// vue-toastification
import { useToast, POSITION } from 'vue-toastification'

import { useUserStore } from '../../stores/user'

import { isValueEmpty, checkEmptyFormInputs } from '../../util/helper'

const route = useRoute()
const toast = useToast()
const user = useUserStore()

const isLoading = ref(false)
const imageFiles = ref([])
const showPreview = ref(false)
// const locationAddressRef = ref()
const googleAutocompleteRef = ref(null)

const formInit = {
  posterID: user.currentUser.id,
  username: user.profile?.username,
  listingType: LISTING_TYPE.Giveaway, // (LISTING_TYPE.Request for CreateEditRequestView.vue)
  listingTitle: '',
  status: '',
  category: '',
  dietaryRestrictions: '',
  foodAllergens: [],
  tags: [],
  description: '',
  images: [],
  quantityNum: '',
  locationAddress: '',
  locationDescription: '',
  locationCoords: ''
}
const form = ref(formInit)
const formErrors = ref({})

onMounted(async () => {
  user.profile = await user.fetchUserProfile()

  if (route.name === 'Edit Giveaway') {
    getGiveawayData()
  }
})

const statusOptions = convertConstantsToDropdownOptions(STATUS)
const allergensOptions = convertConstantsToDropdownOptions(FOOD_ALLERGENS)
const dietaryRestrictionsOptions = convertConstantsToDropdownOptions(DIETARY_RESTRICTIONS)
const servingsizeOptions = convertConstantsToDropdownOptions(SERVING_SIZE)
const categoryOptions = convertConstantsToDropdownOptions(CATEGORY)

const getGiveawayData = async () => {
  const { data, error } = await supabase
    .from('listings')
    .select(
      'poster_id,listingID,listingType, postingTime, listingDesc, locationAddress, locationDesc, category, dietaryRestrictions, allergens, images, listingTitle, tags,status, quantityNum, userProfiles(username, avatarUrl)'
    )
    .match({ listingID: route.params.id, poster_id: user.currentUser.id })
    .single()

  // : avatarUrl = item.avatarUrl

  if (error) {
    console.log('error: ', error)
    // handle the error
  } else {
    // do something with the data (e.g. assign data to an array ref)
    // queryData.value = data
    console.log('form.valueee:: ', form.value)
    form.value = {
      posterID: data.poster_id,
      username: data.userProfiles.username,
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
      locationCoords: data.locationCoords != undefined ? JSON.parse(data.locationCoords) : ''
    }
  }
}

const handleBackBtn = () => {
  router.go(-1)
}

const handleChangeCategoryOption = (event) => {
  if (event.value !== CATEGORY.Food) {
    form.value.quantityNum = ''
    form.value.foodAllergens = FOOD_ALLERGENS.None
    form.value.dietaryRestrictions = DIETARY_RESTRICTIONS.None
  }
}

const handleCreateGiveaway = async () => {
  console.log('checkEmptyFormInputs(form.value) ', checkEmptyFormInputs(form.value))
  if (checkEmptyFormInputs(form.value)) {
    Object.keys(form.value).forEach((key) => {
      console.log(
        'isValueEmpty(form.value[key], key, form.value) ',
        isValueEmpty(form.value[key], key, form.value)
      )
      formErrors.value[key] = isValueEmpty(form.value[key], key, form.value)
    })

    toast.error('Some inputs are not filled in', {
      position: POSITION.TOP_CENTER
    })
    return
  }

  isLoading.value = true
  // Upload the images to a Supabase bucket
  for (let image of imageFiles.value) {
    const imageFileFormat = image.name.split('.')[1] // file format: .jpg/.jpeg/.png
    const filename = `${user.currentUser.id}_${
      image.name
    }_${new Date().getTime()}.${imageFileFormat}`

    const { data: imageUploadResponse, error: imageUploadError } = await supabase.storage
      .from('listings')
      .upload(filename, image.file, {
        contentType: 'auto' // Automatically detect content type
      })

    if (imageUploadError) {
      console.error('Image upload error:', imageUploadError)
      continue // Skip to the next file on error
    }

    const { data: bucketFile } = supabase.storage
      .from('listings')
      .getPublicUrl(imageUploadResponse.path)

    form.value.images.push(bucketFile.publicUrl)
  }

  const { data, error } = await supabase.from('listings').insert({
    poster_id: user.currentUser.id,
    listingType: form.value.listingType,
    listingTitle: form.value.listingTitle,
    status: form.value.status,
    category: form.value.category,
    dietaryRestrictions: form.value.dietaryRestrictions,
    allergens: form.value.foodAllergens,
    tags: form.value.tags,
    listingDesc: form.value.description,
    images: form.value.images,
    quantityNum: form.value.quantityNum ? form.value.quantityNum : 0,
    locationAddress: form.value.locationAddress,
    locationDesc: form.value.locationDescription,
    locationCoords: JSON.stringify(form.value.locationCoords)
  })

  if (error) {
    console.log('createGiveaway error: ', error)
    toast.error('Created Giveaway unsuccessful', {
      position: POSITION.TOP_CENTER
    })
    isLoading.value = false
  } else {
    // Update Carma
    const { data, error } = await supabase
      .from('userProfiles')
      .update({
        currBalanceCarma: user.profile.currBalanceCarma + 20,
        monthlyCarma: user.profile.monthlyCarma + 20,
        totalCarma: user.profile.totalCarma + 20
      })
      .match({ id: user.profile.id })
    if (error) {
      console.log('Error updating user carma:', error.message)
      toast.error('Created Giveaway unsuccessful', {
        position: POSITION.TOP_CENTER
      })
      isLoading.value = false
    } else {
      user.profile = await user.fetchUserProfile()

      router.push({ name: 'Giveaways' })
      toast.success('Created Giveaway successfully', {
        position: POSITION.TOP_CENTER,
        timeout: 5000
      })
      form.value = formInit
    }
  }

  isLoading.value = false
}

const handleEditGiveaway = async () => {
  if (checkEmptyFormInputs(form.value)) {
    Object.keys(form.value).forEach((key) => {
      console.log(
        'isValueEmpty(form.value[key], key, form.value) ',
        isValueEmpty(form.value[key], key, form.value)
      )
      formErrors.value[key] = isValueEmpty(form.value[key], key, form.value)
    })

    toast.error('Some inputs are not filled in', {
      position: POSITION.TOP_CENTER
    })
    return
  }

  isLoading.value = true

  const { data, error } = await supabase.from('listings').upsert(
    [
      {
        listingID: route.params.id,
        poster_id: user.currentUser.id,
        listingType: form.value.listingType,
        listingTitle: form.value.listingTitle,
        status: form.value.status,
        category: form.value.category,
        dietaryRestrictions: form.value.dietaryRestrictions,
        allergens: form.value.foodAllergens,
        tags: form.value.tags,
        listingDesc: form.value.description,
        images: form.value.images,
        quantityNum: form.value.quantityNum,
        locationAddress: form.value.locationAddress,
        locationDesc: form.value.locationDescription
      }
    ]
    // { onConflict: ['poster_id', 'listingID'] } // Specify how to handle conflicts
  )

  if (error) {
    console.log('editGiveaway error: ', error)
    toast.error('Edited Giveaway unsuccessful', {
      position: POSITION.TOP_CENTER
    })
    isLoading.value = false
  } else {
    router.push({ name: 'Giveaways' })
    toast.success('Edited Giveaway successfully', {
      position: POSITION.TOP_CENTER,
      timeout: 5000
    })
    form.value = formInit
  }

  isLoading.value = false
}

const handleUploadImages = (images) => {
  imageFiles.value = images.value
  // form.value.images = images.value.map((image) => image.url)
}

const getAddressData = (addressData, placeResultData, id) => {
  console.log('places: addressData ', addressData)
  console.log('places: placeResultData ', placeResultData)
  googleAutocompleteRef.value = placeResultData.formatted_address
  form.value.locationAddress = placeResultData.formatted_address

  const lat = placeResultData.geometry.location.lat()
  const lng = placeResultData.geometry.location.lng()
  form.value.locationCoords = { lat, lng }
}

const tabletScreen = useMatchMedia(screenSize.tablet)

const handleFocusOut = (key) => {
  formErrors.value[key] = isValueEmpty(form.value[key], key, form.value)

  console.log('formErrors.value[key] ', isValueEmpty(form.value[key]))
}

watch([form.value], () => {
  console.log('form value ', form.value)
  console.log('autocomplete ', googleAutocompleteRef.value)
  console.log('form input values ', checkEmptyFormInputs(form.value))
})
</script>

<template>
  <main>
    <div class="container container-narrow container-create-edit-giveaway">
      <section class="preview">
        <!-- Card goes here -->
        <p class="preview-title">Preview Card</p>
        <ListingsCard
          :listingType="form.listingType"
          :username="user.profile?.username"
          :avatarUrl="user.profile?.avatarUrl"
          :postingTime="null"
          :locationAddress="form.locationAddress"
          :category="form.category"
          :image="form.images?.[0] ?? imageFiles[0]?.url"
          :listingTitle="form.listingTitle"
          :tags="form.tags"
          :status="form.status"
          :quantityNum="form.quantityNum"
          :isPoster="true"
        />
      </section>

      <section class="form-container">
        <form>
          <div class="card-container">
            <CardContainer title="Giveaway Information">
              <div class="giveaway-information">
                <span class="p-float-label giveaway-name">
                  <InputText
                    v-model="form.listingTitle"
                    class="w-full"
                    @focusout="handleFocusOut('listingTitle')"
                    :class="{ 'p-invalid': formErrors['listingTitle'] }"
                  />
                  <label>Giveaway Title</label>
                </span>

                <!-- <div class="p-float-label giveaway-type">
                  <Dropdown
                    v-model="form.listingType"
                    :options="giveawayTypeOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />

                  <label>Giveaway Type</label>
                </div> -->

                <div class="p-float-label giveaway-category">
                  <Dropdown
                    @change="handleChangeCategoryOption"
                    v-model="form.category"
                    @focusout="handleFocusOut('category')"
                    :class="{ 'p-invalid': formErrors['category'] }"
                    :options="categoryOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />

                  <label>Giveaway Category</label>
                </div>

                <div class="p-float-label giveaway-status">
                  <Dropdown
                    v-model="form.status"
                    :options="statusOptions"
                    @focusout="handleFocusOut('status')"
                    :class="{ 'p-invalid': formErrors['status'] }"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />

                  <label for="dd-city">Giveaway Status</label>
                </div>

                <div v-if="form.category === CATEGORY.Food" class="p-float-label giveaway-serving">
                  <Dropdown
                    v-model="form.quantityNum"
                    @focusout="handleFocusOut('quantityNum')"
                    :class="{ 'p-invalid': formErrors['quantityNum'] }"
                    :options="servingsizeOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />

                  <label>Serving Size</label>
                </div>

                <div
                  v-if="form.category === CATEGORY.Food"
                  class="p-float-label giveaway-restrictions"
                >
                  <Dropdown
                    v-model="form.dietaryRestrictions"
                    @focusout="handleFocusOut('dietaryRestrictions')"
                    :class="{ 'p-invalid': formErrors['dietaryRestrictions'] }"
                    :options="dietaryRestrictionsOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />

                  <label>Dietary Restrictions</label>
                </div>

                <div class="card p-fluid giveaway-tags">
                  <span class="p-float-label">
                    <Chips
                      id="chips"
                      @focusout="handleFocusOut('tags')"
                      :class="{ 'p-invalid': formErrors['tags'] }"
                      v-model="form.tags"
                    />
                    <label for="chips">Tags</label>
                  </span>
                </div>

                <div
                  v-if="form.category === CATEGORY.Food"
                  class="p-float-label giveaway-allergens"
                >
                  <MultiSelect
                    display="chip"
                    v-model="form.foodAllergens"
                    @focusout="handleFocusOut('foodAllergens')"
                    :class="{ 'p-invalid': formErrors['foodAllergens'] }"
                    :options="allergensOptions"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />

                  <label>List of Allergens</label>
                </div>

                <span class="p-float-label giveaway-description">
                  <Textarea
                    v-model="form.description"
                    @focusout="handleFocusOut('description')"
                    :class="{ 'p-invalid': formErrors['description'] }"
                    autoResize
                    rows="5"
                    cols="30"
                    class="w-full"
                  />
                  <label>Description</label>
                </span>
              </div>
            </CardContainer>

            <CardContainer title="Location Information">
              <div class="location-information">
                <!-- <span class="p-float-label location">
                  <InputText
                    v-model="form.locationAddress"
                    class="w-full"
                  />
                  <label>Location Address</label>
                </span> -->
                <!-- <span class="p-float-label location">
                  <InputText
                    ref="locationAddressRef"
                    v-model="form.locationAddress"
                    class="w-full"
                  />
                  <input
                    type="text"
                    ref="locationAddressRef"
                    v-model="form.locationAddress"
                    class="w-full"
                  />
                  <label>Location Address</label>
                </span> -->
                <!-- <input
                  style="
                    font-family: inherit;
                    font-feature-settings: inherit;
                    font-size: 1rem;
                    color: #495057;
                    background: #ffffff;
                    padding: 0.75rem 0.75rem;
                    border: 1px solid #ced4da;
                    border-radius: 6px;
                  "
                  type="text"
                  ref="locationAddressRef"
                  v-model="form.locationAddress"
                  class="w-full"
                /> -->

                <VueGoogleAutocomplete
                  id="map"
                  classname="form-control"
                  placeholder="Location Address"
                  ref="googleAutocompleteRef"
                  v-model="form.locationAddress"
                  v-on:placechanged="getAddressData"
                  style="
                    font-family: inherit;
                    font-feature-settings: inherit;
                    font-size: 1rem;
                    color: #495057;
                    background: #ffffff;
                    padding: 0.75rem 0.75rem;
                    border: 1px solid #ced4da;
                    border-radius: 6px;
                  "
                ></VueGoogleAutocomplete>

                <span class="p-float-label giveaway-location-description">
                  <Textarea
                    v-model="form.locationDescription"
                    @focusout="handleFocusOut('locationDescription')"
                    :class="{ 'p-invalid': formErrors['locationDescription'] }"
                    autoResize
                    rows="5"
                    cols="30"
                    class="w-full"
                  />
                  <label>Location Description</label>
                </span>
              </div>
            </CardContainer>

            <CardContainer title="Photo Gallery">
              <div v-if="form.images.length < 1" style="color: #e24c4c; margin-bottom: 10px">
                Please upload an image
              </div>
              <div class="photo-gallery">
                <MultipleImageUpload @uploadImages="handleUploadImages" />
              </div>
            </CardContainer>
          </div>

          <div class="btn-container pt-small">
            <Button
              v-if="tabletScreen"
              icon="pi pi-eye"
              aria-label="Preview"
              rounded
              @click="showPreview = true"
            />
            <div class="next-prev-btn-container">
              <router-link to="">
                <Button
                  severity="warning"
                  icon="pi pi-times"
                  label="Cancel"
                  rounded
                  outlined
                  @click="handleBackBtn"
                />
              </router-link>
              <Button
                v-if="route.name === 'Edit Giveaway'"
                severity="warning"
                icon="pi pi-plus"
                label="Save Changes"
                rounded
                :disabled="isLoading"
                @click="handleEditGiveaway"
              />
              <Button
                v-else
                severity="warning"
                icon="pi pi-plus"
                label="Create"
                rounded
                :disabled="isLoading"
                @click="handleCreateGiveaway"
              />
            </div>
          </div>
        </form>
      </section>
    </div>
  </main>
  <!-- Dialog goes here -->
  <Dialog v-model:visible="showPreview" modal header="Listing Preview" class="preview-dialog">
    <ListingsCard
      :listingType="form.listingType"
      :username="user.profile?.username"
      :avatarUrl="user.profile?.avatarUrl"
      :postingTime="null"
      :locationAddress="form.locationAddress"
      :category="form.category"
      :image="form.images?.[0] ?? imageFiles[0]?.url"
      :listingTitle="form.listingTitle"
      :tags="form.tags"
      :status="form.status"
      :quantityNum="form.quantityNum"
      :isPoster="true"
    />
  </Dialog>
</template>

<style scoped>
.p-overflow-hidden {
  overflow: auto;
}

main {
  padding: unset;
}

.container-create-edit-giveaway {
  max-width: 1150px;
  padding-top: 25px;
}

.preview-title {
  margin-bottom: 20px;
  font-size: 1.3em;
}

.preview-btn-container {
  display: none;
  /* margin-top: 50px; */
}

.preview {
  position: sticky;
  width: var(--preview-card-width);
  /* background: red; */
  padding-left: 30px;
  top: 125px;
}

.form-container {
  margin-top: -350px;
}

.form-container form {
  position: relative;
  max-width: 1150px;
  width: 100%;
}

/*************************
*.Giveaway Information
*************************/
.giveaway-information {
  margin-top: 20px;
  /* display: grid;
  grid-template-areas:
    'giveaway-name        giveaway-name'
    'giveaway-category    giveaway-status'
    'giveaway-serving     giveaway-serving'
    'giveaway-restrictions giveaway-restrictions'
    'giveaway-tags        giveaway-tags'
    'giveaway-allergens   giveaway-allergens'
    'giveaway-description giveaway-description'; */
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
}

.giveaway-name {
  grid-area: giveaway-name;
  /* width: 100%; */
  flex: 100%;
}

/* .giveaway-type {
  grid-area: giveaway-type;
} */
.giveaway-category {
  grid-area: giveaway-category;
  /* width: 50%; */
  flex: 40%;
}

.giveaway-status {
  grid-area: giveaway-status;
  /* width: 50%; */
  flex: 40%;
}

.giveaway-serving {
  grid-area: giveaway-serving;
  /* width: 100%; */
  flex: 100%;
}

.giveaway-restrictions {
  grid-area: giveaway-restrictions;
  /* width: 100%; */
  flex: 100%;
}

.giveaway-tags {
  grid-area: giveaway-tags;
  /* width: 100%; */
  flex: 100%;
}

.giveaway-allergens {
  grid-area: giveaway-allergens;
  /* width: 100%; */
  flex: 100%;
}

.giveaway-description {
  grid-area: giveaway-description;
  /* width: 100%; */
  flex: 100%;
}

/*************************
*.Location Information
*************************/
.location-information {
  margin-top: 20px;
  display: grid;
  grid-template-areas: '';
  gap: 40px;
}

/*************************
*.Photo Gallery
*************************/
.photo-gallery {
  /* margin-top: 20px; */
}

.btn-container {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: center;
  gap: 15px;
  background: white;
  box-shadow: 0 -7px 30px rgba(0, 0, 0, 0.075);
  width: inherit;
  padding: 15px;
  z-index: 999;
}

.next-prev-btn-container {
  display: flex;
  gap: 15px;
}

@media screen and (max-width: 768px) {
  main {
    padding-top: 40px;
  }

  .preview-btn-container {
    display: flex;
    justify-content: right;
  }

  .preview {
    display: none;
  }

  .card-container {
    margin-left: unset;
  }

  .btn-container {
    justify-content: space-between;
  }

  .form-container {
    margin-top: 0px;
  }

  .giveaway-information {
    /* grid-template-areas:
      'giveaway-name'
      'giveaway-status'
      'giveaway-category'
      'giveaway-serving'
      'giveaway-restrictions'
      'giveaway-tags'
      'giveaway-allergens'
      'giveaway-description'; */
    gap: 40px;
  }

  .giveaway-category {
    grid-area: giveaway-category;
    /* width: 50%; */
    flex: 100%;
  }

  .giveaway-status {
    grid-area: giveaway-status;
    /* width: 50%; */
    flex: 100%;
  }
}
</style>
