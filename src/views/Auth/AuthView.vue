<script setup>
import { useRoute } from 'vue-router'

import LoginForm from '../../components/Auth/LoginForm.vue'
import SignupForm from '../../components/Auth/SignupForm.vue'

const route = useRoute()
</script>

<template>
  <LoginForm v-if="route.name === 'Login'" />
  <SignupForm v-if="route.name === 'Signup'" />
</template>

<style scoped></style>
