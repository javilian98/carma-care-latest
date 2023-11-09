<script setup>
import ListingsHeader from '../../components/Listings/ListingsHeader.vue'
import ListingsCard from '../../components/Listings/ListingsCard.vue'
import { useUserStore } from '../../stores/user'
import { supabase } from '@/lib/supabase'
import { ref, onMounted } from 'vue'
import ProgressSpinner from 'primevue/progressspinner/ProgressSpinner.vue'
const queryData = ref([])
const user = useUserStore()
const currentUser = user.currentUser?.id
const isSearching = ref()
// grab user id

onMounted(() => {
  getData(queryData)
})

async function getData(queryData) {
  isSearching.value = true
  // const columnsToSelect='listingType', 'username', 'postingTime', 'locationAddress', 'category', 'image', 'listingTitle', 'tags', 'quantityNum', 'quantityUnit'
  const { data, error } = await supabase
    .from('listings')
    .select(
      'poster_id,listingID,listingType, postingTime, locationAddress, category, images, listingTitle, tags,status, quantityNum, userProfiles(username, avatarUrl)'
    )
    .eq('listingType', 'Request')
    .neq('status', 'Unavailable')
    .order('postingTime', { ascending: false })

  // : avatarUrl = item.avatarUrl

  if (error) {
    console.log('error: ', error)
    // handle the error
  } else {
    // do something with the data (e.g. assign data to an array ref)
    queryData.value = data
    isSearching.value = false
  }
}

async function getFiltered(condition) {
  isSearching.value = true

  var categoryFilter = condition.categoryFilter
  var restrictionsFilter = condition.restrictionsFilter
  var allergensFilter = condition.allergensFilter

  var query = supabase
    .from('listings')
    .select(
      'poster_id,listingID,listingType,allergens, postingTime, locationAddress, category, images, listingTitle, tags,status, quantityNum, userProfiles(username, avatarUrl)'
    )
    .eq('listingType', 'Request')

  query.in('category', categoryFilter)

  if (restrictionsFilter != 'Null') {
    query.eq('dietaryRestrictions', restrictionsFilter)
  }

  query.neq('status', 'Unavailable')

  const { data, error } = await query.order('postingTime', { ascending: false })

  if (error) {
    console.log('error: ', error)
    // handle the error
  } else {
    // do something with the data (e.g. assign data to an array ref)
    var output = []
    var noAllergens = true
    if (allergensFilter != '') {
      for (var record in data) {
        if (data[record].allergens != null) {
          for (var allergen of allergensFilter) {
            allergen = allergen.slice(3)

            if (data[record].allergens.includes(allergen)) {
              noAllergens = false
              break
            }
          }
        }

        if (noAllergens) {
          output.push(data[record])
        }
        noAllergens = true
      }
      isSearching.value = false

      return output
    } else {
      isSearching.value = false

      return data
    }
  }
}

async function search(searchData) {
  isSearching.value = true
  if (searchData == undefined) {
    searchData = ''
  }
  if (typeof this.timer !== 'undefined') {
    clearTimeout(this.timer)
    this.timer = null
  }
  this.timer = setTimeout(async () => {
    // your code
    // const columnsToSelect='listingType', 'username', 'postingTime', 'locationAddress', 'category', 'image', 'listingTitle', 'tags', 'quantityNum', 'quantityUnit'
    isSearching.value = true

    const { data, error } = await supabase
      .from('listings')
      .select(
        'poster_id,listingID,listingType, postingTime, locationAddress, category, images, listingTitle, tags,status, quantityNum, userProfiles(username, avatarUrl)'
      )
      .ilike('listingTitle', '%' + searchData + '%')
      .eq('listingType', 'Request')
      .neq('status', 'Unavailable')
      .order('postingTime', { ascending: false })

    if (error) {
      console.log('error: ', error)
      // handle the error
    } else {
      // do something with the data (e.g. assign data to an array ref)
      queryData.value = data
      isSearching.value = false
    }
  }, 300)
}
</script>

<!-- play with time data -->

<template>
  <main class="giveaways">
    <ListingsHeader
      @passQuery="async (query) => (queryData = await getFiltered(query))"
      @passSearch="async (query) => (queryData = await search(query))"
      searchBarPlaceholder="Search Requests"
      createButtonRouteName="Create Request"
    />
    <div>
      <ProgressSpinner class="listings-cards" v-if="isSearching" />
      <div v-else>
        <h4 class="container listings-cards" style="margin-bottom: 0px">
          Showing {{ queryData.length }} result:
        </h4>
        <div class="container listings-cards">
          <ListingsCard
            v-for="item in queryData"
            :key="item.listingID"
            :listingID="item.listingID"
            :listingType="item.listingType"
            :username="item.userProfiles.username"
            :avatarUrl="item.userProfiles.avatarUrl"
            :postingTime="item.postingTime"
            :locationAddress="item.locationAddress"
            :category="item.category"
            :image="item.images[0]"
            :listingTitle="item.listingTitle"
            :tags="item.tags"
            :status="item.status"
            :quantityNum="item.quantityNum"
            :isPoster="item.poster_id == currentUser"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.listings-cards {
  margin-bottom: 70px;
}
</style>
