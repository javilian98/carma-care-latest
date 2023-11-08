<script setup>
import { defineProps, toRefs, inject } from 'vue'

const props = defineProps({
  icon: String,
  title: String
})

const { title } = toRefs(props)

const selectedTitle = inject('selectedTitle')
</script>

<template>
  <div v-show="title === selectedTitle">
    <slot />
  </div>
</template>

<style lang="scss" scoped></style>
