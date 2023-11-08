<script setup>
import AvatarMenu from '../AvatarMenu.vue'
import { useUserStore } from '../../stores/user'

import Avatar from 'primevue/avatar/Avatar.vue'

const user = useUserStore()
</script>

<template>
  <nav class="nav-bar-mobile-links">
    <ul>
      <li>
        <router-link to="/" :class="{ 'nav-link-active': $route.name === 'Giveaways' }">
          <i class="pi pi-gift" style="font-size: 1.6rem"></i>
          <span>Giveaways</span>
        </router-link>
      </li>
      <li>
        <router-link
          :to="{ name: 'Requests' }"
          :class="{ 'nav-link-active': $route.name === 'Requests' }"
        >
          <i class="pi pi-megaphone" style="font-size: 1.6rem"></i>
          <span> Requests</span>
        </router-link>
      </li>
      <li v-if="user.currentUser !== null" class="nav-avatar-menu">
        <AvatarMenu />
        <span class="label">My Profile</span>
      </li>
      <router-link
        v-else
        :to="{ name: 'Login' }"
        :class="{ 'nav-link-active': $route.name === 'Login' }"
      >
        <li class="nav-avatar-menu" style="margin-bottom: 2px">
          <Avatar
            icon="pi pi-user"
            shape="circle"
            :style="
              $route.name === 'Login'
                ? {
                    background: 'transparent',
                    color: 'var(--color-primary)',
                    border: 'solid 2px var(--color-primary)'
                  }
                : {}
            "
          />
          <span class="label" style="font-size: 1em">My Profile</span>
        </li>
      </router-link>
    </ul>
  </nav>
</template>

<style scoped>
.nav-bar-mobile-links {
  display: flex;
  align-items: center;
  /* border: solid 1px red; */
}
.nav-bar-mobile-links ul {
  height: 100%;
  display: flex;
  /* gap: 40px; */
  list-style-type: none;
  margin: 0;
  padding: 0;
}
.nav-bar-mobile-links li {
  display: flex;
  height: 100%;
}
.nav-bar-mobile-links a {
  width: 150px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding-top: 5px;
  text-decoration: none;
  border-top: solid 3px transparent;
  font-size: 0.8em;
  color: #222;
}
.nav-bar-mobile-links a.nav-link-active {
  border-top: solid 3px var(--color-primary);
  color: var(--color-primary);
}

.nav-avatar-menu {
  /* border: solid 1px red; */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  width: 150px;
  margin-top: 2px;
}

.nav-avatar-menu .label {
  display: flex;
  font-size: 0.8em;
}

@media screen and (max-width: 480px) {
  .nav-bar-mobile-links a,
  .nav-avatar-menu {
    width: 100px;
  }
}
</style>
