<script setup>
import { defineProps, toRefs } from 'vue'

const props = defineProps({
  userCarma: String
})

const { userCarma } = toRefs(props)

</script>

<template>
  <div class="nav-btns-carma-coins">
    <i class="pi pi-hourglass"></i>
    <span>{{ userCarma? parseInt(userCarma) : 0 }}</span>
  </div>
</template>

<style scoped>
.nav-btns-carma-coins {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-primary);
}
</style>
