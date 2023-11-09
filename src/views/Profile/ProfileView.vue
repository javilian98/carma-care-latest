<script setup>
import Tab from '../../components/Tab/Tab.vue'
import TabsWrapper from '../../components/Tab/TabsWrapper.vue'
import ListingsCard from '../../components/Listings/ListingsCard.vue'
import { useMatchMedia, screenSize } from '../../composables/useMatchMedia'
import Button from 'primevue/button/Button.vue'
import Avatar from 'primevue/avatar/Avatar.vue'
import Dialog from 'primevue/dialog/Dialog.vue'
import Tag from 'primevue/tag/Tag.vue'
import Chart from 'primevue/chart/Chart.vue'
import { ref, onMounted } from 'vue'
import { LISTING_TYPE } from '../../util/constants'

// supabase
import { supabase } from '@/lib/supabase'

// stores
import { useUserStore } from '../../stores/user'

import { useRoute } from 'vue-router'
import router from '../../router'
// user info consts from db
const user = useUserStore()
const route = useRoute()
const profileInfo = ref({})
const giveaways = ref()
const requests = ref()
const num_giveaways = ref(0)
const num_requests = ref(0)

// Carma chart
const chartData = ref()
const chartOptions = ref()
const chartMonths = ref()
const carmaData = ref()

// Reviews
const reviews = ref()

// Breakpoint for responsiveness
const tabletScreen = useMatchMedia(screenSize.tablet)

// For modals
var dietary_restrictions_visible = ref(false)
var statistics_visible = ref(false)

// Init on Load page
onMounted(async () => {
  // profileInfo.value = user.profile
  // console.log(user.profile,"----------")
  await getPosterInfo()
  getListings()
  chartMonths.value = getMonthsArr()
  carmaData.value = setCarmaData()
  chartData.value = setChartData()
  chartOptions.value = setChartOptions()
  getReviews()
})

async function getPosterInfo() {
  const { data, error } = await supabase
    .from('userProfiles')
    .select('*')
    .eq('handle', route.params.handle.substring(1))
    .single()

  if (error) {
    console.log('error: ', error)
  } else {
    profileInfo.value = data
  }
}

// sorting function for sorting listings by date
function listing_custom_sort(a, b) {
  return new Date(b.postingTime).getTime() - new Date(a.postingTime).getTime()
}

// Fetch user listings from db for giveaway and request count
async function getListings() {
  // get all listings from this user
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .eq('poster_id', profileInfo.value.id)

  if (error) {
    console.log('error: ', error)
  } else {
    // filter out the giveaways and requests
    var own_giveaways = data.filter((listing) => {
      return listing.listingType === LISTING_TYPE.Giveaway
    })
    var own_requests = data.filter((listing) => {
      return listing.listingType === LISTING_TYPE.Request
    })

    giveaways.value = own_giveaways
    num_giveaways.value = own_giveaways.length
    requests.value = own_requests
    num_requests.value = own_requests.length

    giveaways.value.sort(listing_custom_sort)
    requests.value.sort(listing_custom_sort)
  }
}

let getMonthsArr = () => {
  var dateObj = new Date()
  var dateStrings = []
  var currDateMonth = new Date().getMonth() + 1
  var dateFormatOptions = {}
  var numOfMonths = profileInfo?.value.carmaHistory ? profileInfo.value.carmaHistory.length + 1 : 1 // Add 1 to include curr month

  if (numOfMonths <= currDateMonth) {
    dateFormatOptions = {
      month: 'short'
    }
  } else {
    dateFormatOptions = {
      month: 'short',
      year: 'numeric'
    }
  }

  for (var i = 0; i < numOfMonths; i++) {
    dateObj.setMonth(dateObj.getMonth() - 1)
    dateStrings.unshift(dateObj.toLocaleString('en-US', dateFormatOptions))
  }

  return dateStrings
}

const setCarmaData = () => {
  var history = profileInfo?.value.carmaHistory ? [...profileInfo.value.carmaHistory] : []
  history.push(profileInfo.value.monthlyCarma)

  return history
}

const setChartData = () => {
  return {
    labels: chartMonths,
    datasets: [
      {
        label: 'Carma Points',
        data: carmaData,
        backgroundColor: 'rgba(246,132,56, 0.5)',
        borderColor: '#f68438',
        borderWidth: 1
      }
    ]
  }
}

const setChartOptions = () => {
  const documentStyle = getComputedStyle(document.documentElement)
  const textColor = documentStyle.getPropertyValue('--text-color')
  const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary')
  const surfaceBorder = documentStyle.getPropertyValue('--surface-border')

  return {
    plugins: { legend: { labels: { color: textColor } } },
    scales: {
      x: {
        ticks: { color: textColorSecondary },
        grid: { color: surfaceBorder }
      },
      y: {
        beginAtZero: true,
        ticks: { color: textColorSecondary },
        grid: { color: surfaceBorder }
      }
    }
  }
}

// Fetch user reviews from db
async function getReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('revieweeID', profileInfo.value.id)

  if (error) {
    console.log('error: ', error)
  } else {
    reviews.value = data
  }
  getReviewUserInfo()
}

// sorting function for sorting reviews by date
function custom_sort(a, b) {
  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
}

// retrieve reviewer information and sort
async function getReviewUserInfo() {
  for (const review of reviews.value) {
    const { data, error } = await supabase
      .from('userProfiles')
      .select('*')
      .eq('id', review.reviewerID)

    if (error) {
      console.log('error: ', error)
    } else {
      review.reviewerUsername = data[0].username
      review.reviewerHandle = data[0].handle
      review.reviewerAvatarUrl = data[0].avatarUrl
    }
  }

  reviews.value.sort(custom_sort)
}

let toggleModal = () => {
  if (dietary_restrictions_visible.value) {
    dietary_restrictions_visible.value = !dietary_restrictions_visible.value
  } else if (statistics_visible.value) {
    statistics_visible.value = !statistics_visible.value
  }
}
</script>

<template>
  <main class="remove-padding profile-view">
    <section class="profile">
      <div class="profile-content">
        <Avatar
          v-if="profileInfo.avatarUrl"
          :image="profileInfo.avatarUrl"
          class="profile-photo"
          shape="circle"
        />
        <Avatar
          v-else
          :label="`${profileInfo?.username ? profileInfo.username.charAt(0).toUpperCase() : ''}`"
          class="profile-photo"
          shape="circle"
        />
        <div class="profile-info">
          <div style="display: flex; justify-content: space-between; padding-bottom: 20px">
            <div>
              <h1>{{ profileInfo.username }}</h1>
              <p style="color: var(--color-primary)">@{{ profileInfo.handle }}</p>
            </div>
            <router-link :to="{ name: 'Edit Profile' }">
              <Button type="button" class="edit-button" label="Edit Profile" icon="pi pi-cog" />
            </router-link>
          </div>
          <p style="padding-bottom: 20px">{{ profileInfo.description }}</p>
          <Button class="dietary-restrictions" @click="dietary_restrictions_visible = true"
            >Dietary Restrictions</Button
          >
        </div>
        <div class="profile-statistics">
          <div
            style="
              width: fill-available;
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <div style="display: flex">
              <div class="statistics-icon-wrapper">
                <div><Button class="icon" icon="pi pi-star" /></div>
                <div>
                  <h3>{{ num_giveaways }}</h3>
                  <p>Giveaways Made</p>
                </div>
              </div>
              <div class="statistics-icon-wrapper">
                <div><Button class="icon" icon="pi pi-download" /></div>
                <div>
                  <h3>{{ num_requests }}</h3>
                  <p>Requests Made</p>
                </div>
              </div>
            </div>
            <div>
              <Button
                v-if="tabletScreen"
                type="button"
                class="statistics-button"
                @click="statistics_visible = true"
                icon="pi pi-chart-bar"
              />
              <Button
                v-else
                type="button"
                class="statistics-button"
                @click="statistics_visible = true"
                label="View Statistics"
                icon="pi pi-chart-bar"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="my-listings">
      <TabsWrapper>
        <Tab icon="pi-gift" title="Giveaways">
          <div class="container pt-small">
            <!-- <h3 v-if="num_giveaways == 0">No Giveaways Yet</h3> -->
            <div v-if="num_giveaways == 0" class="empty-view">
              <span
                >You have yet to post any Giveaways!
                <router-link :to="{ path: '/giveaways/create' }">
                  <a>Make one now!</a>
                </router-link>
              </span>
              <img
                src="../../assets/images/no_listings_bg.svg"
                alt="No Listings Default View"
                class="empty-view-img"
              />
            </div>
            <div class="listings-cards">
              <ListingsCard
                v-for="item in giveaways"
                :key="item.listingID"
                :listingID="item.listingID"
                :listingType="item.listingType"
                :username="profileInfo.username"
                :avatarUrl="profileInfo.avatarUrl"
                :postingTime="item.postingTime"
                :locationAddress="item.locationAddress"
                :category="item.category"
                :image="item.images[0]"
                :listingTitle="item.listingTitle"
                :tags="item.tags"
                :status="item.status"
                :quantityNum="item.quantityNum"
                :isPoster="item.poster_id === user.currentUser?.id"
              />
            </div>
          </div>
        </Tab>
        <Tab icon="pi-megaphone" title="Requests">
          <div class="container pt-small">
            <div v-if="num_requests == 0" class="empty-view">
              <span
                >You have yet to make any Requests!
                <router-link :to="{ path: '/requests/create' }">
                  <a>Make one now!</a>
                </router-link>
              </span>
              <img
                src="../../assets/images/no_listings_bg.svg"
                alt="No Listings Default View"
                class="empty-view-img"
              />
            </div>
            <div class="listings-cards">
              <ListingsCard
                v-for="item in requests"
                :key="item.listingID"
                :listingID="item.listingID"
                :listingType="item.listingType"
                :username="profileInfo.username"
                :avatarUrl="profileInfo.avatarUrl"
                :postingTime="item.postingTime"
                :locationAddress="item.locationAddress"
                :category="item.category"
                :image="item.images[0]"
                :listingTitle="item.listingTitle"
                :tags="item.tags"
                :status="item.status"
                :quantityNum="item.quantityNum"
                :isPoster="item.poster_id === user.currentUser?.id"
              />
            </div>
          </div>
        </Tab>
      </TabsWrapper>
    </section>
  </main>

  <div
    v-if="dietary_restrictions_visible || statistics_visible"
    class="profile-view profile-view-modal"
    @click="toggleModal"
  ></div>
  <Dialog
    :visible="dietary_restrictions_visible"
    :draggable="false"
    :header="`${profileInfo.username}'s Dietary Restrictions`"
    :style="{ width: '50vw' }"
    class="profile-view"
  >
    <h3>Special Dietary Requirements</h3>
    <div v-if="profileInfo.dietaryRestrictions">
      <Tag class="category tag" :value="profileInfo.dietaryRestrictions"></Tag>
    </div>
    <div v-else>
      <p>None</p>
    </div>
    <h3 style="margin-top: 10px">Allergies</h3>
    <div v-if="profileInfo.allergies.length != 0">
      <Tag
        v-for="(item, index) in profileInfo.allergies"
        :key="index"
        class="category tag"
        :value="item"
      ></Tag>
    </div>
    <div v-else>
      <p>None</p>
    </div>
  </Dialog>
  <Dialog
    :visible="statistics_visible"
    :draggable="false"
    :header="`${profileInfo.username}'s Activity`"
    :style="{ width: '50vw', height: '75%' }"
    class="profile-view"
  >
    <TabsWrapper>
      <Tab icon="pi-hourglass" title="Carma">
        <div class="container pt-small">
          <h3 style="text-align: center">
            All-time Carma:<span class="statistics-carma-text"
              ><i style="margin: 0 5px" class="pi pi-hourglass"></i
              >{{ profileInfo.totalCarma }}</span
            >
          </h3>
          <h3 style="text-align: center">
            Carma earned this month:<span class="statistics-carma-text"
              ><i style="margin: 0 5px" class="pi pi-hourglass"></i
              >{{ profileInfo.monthlyCarma }}</span
            >
          </h3>
          <h3 style="text-align: center">
            Total Carma Donated to the Community:<span class="statistics-carma-text"
              ><i style="margin: 0 5px" class="pi pi-hourglass"></i
              >{{ profileInfo.totalDonatedCarma }}</span
            >
          </h3>
          <br />
          <div>
            <Chart
              type="bar"
              :data="chartData"
              :options="chartOptions"
              :canvasProps="{ display: 'flex' }"
            />
          </div>
        </div>
      </Tab>
      <Tab icon="pi-thumbs-up" title="Reviews">
        <div class="container pt-small">
          <div class="review-card" v-for="(review, index) in reviews" :key="index">
            <div class="review-header">
              <div>
                <Avatar
                  v-if="review.reviewerAvatarUrl != null"
                  id="avatar"
                  class="mr-2"
                  size="large"
                  shape="circle"
                  :image="review.reviewerAvatarUrl"
                />
                <Avatar
                  v-else
                  id="avatar"
                  class="mr-2"
                  size="large"
                  shape="circle"
                  :label="review.reviewerUsername?.[0].toUpperCase()"
                />
              </div>
              <div>
                <div>
                  <h3>{{ review.reviewerUsername }}</h3>
                  <p style="color: grey; font-size: 14px">@{{ review.reviewerHandle }}</p>
                </div>
              </div>
            </div>
            <div>
              <p>{{ review.reviewText }}</p>
            </div>
          </div>
        </div>
      </Tab>
    </TabsWrapper>
  </Dialog>
</template>

<style>
.profile-view .empty-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  width: 100%;
}

.profile-view .empty-view-img {
  width: 50%;
  max-width: 400px;
}

.profile-view canvas {
  display: initial !important;
  width: 100% !important;
  height: 50% !important;
}

.profile-view .statistics-icon-wrapper {
  display: flex;
  width: 150px;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
}

.profile-view .statistics-carma-text {
  font-size: 1.2rem;
  color: var(--color-primary);
}

.profile-view .statistics-button {
  background: none;
  color: var(--color-primary);
  border-radius: 100px;
  border-color: var(--color-primary);
}

.profile-view-modal {
  top: 0;
  position: fixed;
  background: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
}

.profile-view .review-header {
  display: flex;
  margin-bottom: 4px;
}

.profile-view .review-card {
  margin-bottom: 30px;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 5px 5px rgba(246, 132, 56, 0.3);
  border: 1px solid rgba(246, 132, 56, 0.3);
}

.profile-view .tag {
  background-color: var(--color-primary);
  margin-right: 5px;
}

.profile-view .edit-button {
  background: var(--color-primary);
  color: white;
  border-radius: 100px;
  border: none;
}

.profile-view .profile {
  display: flex;
  width: 100%;
  height: 100%;
  background: rgba(246, 132, 56, 0.03);
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-view .profile-content {
  display: grid;
  grid-template-areas:
    'profile-photo profile-info profile-info'
    'statistics statistics statistics';
  gap: 30px;
  padding: 10px;
  width: 600px;
  justify-content: center;
}

.profile-view .profile-photo {
  grid-area: profile-photo;
  background: darkgray;
  height: 200px;
  width: 200px;
  border-radius: 200px;
  line-height: 200px;
  text-align: center;
  font-size: 8em;
  background-color: #4caf4f;
  color: #fff;
}

.profile-view .profile-info {
  grid-area: profile-info;
  width: fill-available;
}

.profile-view .profile-statistics {
  grid-area: statistics;
}

@media only screen and (max-width: 768px) {
  .profile-view .profile-content {
    grid-template-areas:
      'profile-photo statistics'
      'profile-info profile-info';
    align-items: center;
    width: 100%;
  }

  .profile-view .profile-photo {
    height: 150px;
    width: 150px;
    font-size: 6em;
  }

  .profile-view .icon {
    display: none;
  }

  .profile-view .statistics-button {
    font-size: 0;
  }

  .profile-view .statistics-icon-wrapper {
    max-width: 100px;
  }
}

.profile-view Button.icon {
  background: rgba(246, 132, 56, 0.75);
  color: black;
  border-radius: 100%;
  outline: none;
  border: none;
  margin-right: 15px;
}

.profile-view Button.dietary-restrictions {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: none;
  border-radius: 50px;
  outline: none;
}

/*******************
Overriding PrimeVue's tab component styles 
********************/
.profile-view .tabview-custom {
  display: grid;
  justify-items: center;
}

.profile-view .tabview-custom > a {
  width: 170px !important;
}
</style>
