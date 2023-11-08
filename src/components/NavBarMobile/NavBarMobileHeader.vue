<script setup>
import { useRoute } from 'vue-router'

// primevue
import Button from 'primevue/Button'

// custom components
import NotificationButton from '../NotificationButton.vue'
import Logo from '../Logo/Logo.vue'

// router
import router from '../../router'

// stores
import { useUserStore } from '../../stores/user'

const user = useUserStore()
const route = useRoute()
</script>

<template>
  <div class="nav-mobile-header">
    <Logo />
    <h3 class="page-title">{{ route.name }}</h3>

    <template v-if="route.name !== 'Login'">
      <Button
        v-if="user.currentUser === null"
        label="Login"
        severity="warning"
        size="small"
        @click="router.push({ name: 'Login' })"
      />
      <NotificationButton v-else />
    </template>
  </div>
</template>

<style scoped>
.nav-mobile-header {
  position: fixed;
  display: grid;
  grid-template-columns: 22% 56% 22%;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 65px;
  background: white;
  box-shadow: 0 3px 15px rgba(0, 0, 0, 0.1);
  padding: 0 10px;
  z-index: 999;
}

.page-title {
  display: flex;
  justify-content: center;
  margin-bottom: 0;
}
</style>
