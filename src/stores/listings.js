import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useListingsStore = defineStore('listings', () => {
  const listingsHeader = ref({
    placeholder: 'Search Giveaways',
    routeName: 'Create Giveaway'
  })

  const selectedPosterHandle = ref("")
  return { listingsHeader, selectedPosterHandle }
})
