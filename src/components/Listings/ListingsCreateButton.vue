<script setup>
import { defineProps, toRefs } from 'vue'
import Button from 'primevue/button/Button.vue'
import { useMatchMedia, screenSize } from '../../composables/useMatchMedia'

const props = defineProps({
  routeName: String
})
const { routeName } = toRefs(props)

const tabletScreen = useMatchMedia(screenSize.tablet)
</script>

<template>
  <div v-if="tabletScreen">
    <router-link :to="{ name: routeName }">
      <Button icon="pi pi-plus" rounded aria-label="Create" severity="warning" />
    </router-link>
  </div>
  <div v-else>
    <router-link :to="{ name: routeName }">
      <Button icon="pi pi-plus" label="Create" rounded severity="warning" />
    </router-link>
  </div>
</template>

<style scoped>
button {
  margin-left: 15px;
}
</style>
