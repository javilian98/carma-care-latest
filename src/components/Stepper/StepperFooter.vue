<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  position: String
})

const getPosition = computed(() => {
  switch (props.position) {
    case 'left':
      return 'left'
    case 'center':
      return 'center'
    case 'right':
      return 'right'
    default:
      return 'left'
  }
})
</script>

<template>
  <div class="stepper-footer" :style="{ justifyContent: `${getPosition}` }">
    <slot />
  </div>
</template>

<style scoped>
.stepper-footer {
  display: flex;
  gap: 15px;
  padding: 30px 0;
}

:slotted(button) {
  min-width: 150px;
}
</style>
