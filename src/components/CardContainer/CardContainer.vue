<script setup>
import { defineProps, toRefs } from 'vue'

const props = defineProps({
  title: String
})

const { title } = toRefs(props)
</script>

<template>
  <div class="card-container">
    <h2>{{ title }}</h2>
    <slot />
  </div>
</template>

<style scoped>
.card-container {
  margin-left: 350px;
  margin-bottom: 40px;
  background: #fff;
  border-radius: 25px;
  padding: 30px;
  box-shadow: 0 3px 30px rgba(0, 0, 0, 0.075);
}

h2 {
  margin-bottom: 50px;
}
</style>
