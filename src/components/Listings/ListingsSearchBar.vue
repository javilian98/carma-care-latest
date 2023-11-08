<script setup>
import { defineProps, toRefs, ref } from 'vue'
import InputText from 'primevue/InputText'

const props = defineProps({
  placeholder: String
})
const { placeholder } = toRefs(props)
const input = ref()

defineEmits(['passSearch'])
</script>

<template>
  <span class="p-input-icon-left listings-header-search-container">
    <i class="pi pi-search" />
    <InputText
      class="listings-header-search"
      type="text"
      v-model="input"
      :placeholder="placeholder"
      @keyup="$emit('passSearch', input)"
    />
  </span>
</template>

<style scoped>
.listings-header-search-container {
  width: 100%;
  max-width: 500px;
}

.listings-header-search-container i {
  color: var(--color-primary);
}

.listings-header-search {
  width: 100%;
  border-radius: 100px;
  border: solid 1.5px transparent;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.08);
  /* border: solid 1.5px var(--color-primary); */
}

@media screen and (max-width: 768px) {
  .listings-header-search-container {
    max-width: unset;
  }
}
</style>
