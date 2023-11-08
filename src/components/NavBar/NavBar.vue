<script setup>
import { useRoute } from 'vue-router'

// router
import router from '../../router'

// stores
import { useUserStore } from '../../stores/user'

// primevue
import Button from 'primevue/Button'

// custom components
import Logo from '@/components/Logo/Logo.vue'
import NavBarLinks from './NavBarLinks.vue'
import NavCarmaCoins from '@/components/NavCarmaCoins.vue'
import AvatarMenu from '@/components/AvatarMenu.vue'
import NotificationButton from '@/components/NotificationButton.vue'

const user = useUserStore()
const route = useRoute()
</script>

<template>
  <div class="nav-bar">
    <Logo />

    <template v-if="route.name === 'Giveaways' || route.name === 'Requests'">
      <NavBarLinks />
    </template>
    <template v-else>
      <div class="page-title-container">
        <h1 class="page-title">{{ $route.name }}</h1>
      </div>
    </template>

    <div class="nav-btns">
      <template v-if="route.name !== 'Login' && route.name !== 'Signup'">
        <template v-if="user.currentUser === null">
          <Button
            label="Login"
            severity="warning"
            size="small"
            @click="router.push({ name: 'Login' })"
          />
        </template>
        <template v-else>
          <NavCarmaCoins :userCarma="String(user.profile ? user.profile.currBalanceCarma : 0)"/>
          <AvatarMenu />
          <NotificationButton />
        </template>
      </template>
    </div>
  </div>
</template>

<style scoped>
.nav-bar {
  background: white;
  position: fixed;
  display: grid;
  grid-template-columns: 20% 60% 20%;
  width: 100%;
  height: 65px;
  padding: 0 40px;
  /* border-bottom: solid 1px black; */
  box-shadow: 0 1px 15px rgba(0, 0, 0, 0.1);
}

.nav-bar > nav,
.nav-bar > div {
  display: flex;
  align-items: center;
  /* border: solid 1px red; */
}

.page-title-container {
  justify-content: center;
}

.nav-btns {
  display: flex;
  justify-content: right;
  gap: 30px;
}

@media screen and (max-width: 1550px) {
  .nav-bar {
    grid-template-columns: 25% 50% 25%;
  }
}
@media screen and (max-width: 1024px) {
  .nav-bar {
    grid-template-columns: 30% 40% 30%;
  }
}
</style>
