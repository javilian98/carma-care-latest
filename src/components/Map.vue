<script setup>
/* eslint-disable no-undef */
import { computed, onMounted, watch, ref, defineProps, toRefs } from 'vue'
import { useGeolocation } from '../composables/useGeolocation'
import { Loader } from '@googlemaps/js-api-loader'

const props = defineProps({
  locationCoords: Object
})
const { locationCoords } = toRefs(props)

const { coords } = useGeolocation()
const currPos = computed(() => {
  //   return {
  //     lat: coords.value.latitude,
  //     lng: coords.value.longitude
  //   }

  console.log('locationCoords Props: ', locationCoords.value)

  return {
    lat: locationCoords?.value.lat,
    lng: locationCoords?.value.lng
  }
})
const loader = new Loader({ apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY })
const mapRef = ref(null)
const mapDiv = ref(null)
let marker = null

const geolocationSuccess = async (position) => {
  const lat = locationCoords?.value.lat || position.coords.latitude
  const lng = locationCoords?.value.lng || position.coords.longitude

  console.log(`latitude: ${lat}, longitude: ${lng}`)

  currPos.value.lat = lat
  currPos.value.lng = lng

  if (mapRef.value == null) {
    return
  }

  mapDiv.value = new google.maps.Map(mapRef.value, {
    center: { lat, lng },
    zoom: 15
  })

  marker = new google.maps.Marker({
    position: { lat, lng },
    map: mapDiv.value
  })
}

const geolocationError = (err) => {
  console.log(err)
}

onMounted(async () => {
  await loader.load()
  navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError)
})

watch([mapDiv, currPos], () => {
  // console.log("latlng: ", currentLocation.latLng);
  if (marker) marker.setMap(null)
  if (mapDiv.value) {
    // Update the map center
    const newCenter = new google.maps.LatLng(currPos.value.lat, currPos.value.lng)
    mapDiv.value.setCenter(newCenter)

    marker = new google.maps.Marker({
      position: currPos.value,
      map: mapDiv.value
    })

    console.log('watch position: ', currPos.value)

    // isDisabled.value = false;
  }
})
</script>

<template>
  <div class="map" ref="mapRef" />
</template>

<style scoped>
.map {
  width: 100%;
  height: 300px;
  background: gray;
  border-radius: 25px;
  display: grid;
  place-items: center;
  /* margin-top: 20px; */
}
</style>
