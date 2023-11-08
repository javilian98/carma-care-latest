<script setup>
import NavBar from '@/components/NavBar/NavBar.vue'
import NavBarMobileHeader from '../components/NavBarMobile/NavBarMobileHeader.vue'
import NavBarMobileMenu from '../components/NavBarMobile/NavBarMobileMenu.vue'
import { useMatchMedia, screenSize } from '@/composables/useMatchMedia'
import { useChatStore } from '../stores/chat'

const tabletScreen = useMatchMedia(screenSize.tablet)

const chat = useChatStore()
</script>

<template>
  <div>
    <header>
      <template v-if="tabletScreen">
        <NavBarMobileHeader />
        <template v-if="$route.name !== 'Create Giveaway' && $route.name !== 'Create Request'">
          <template v-if="chat.selectedContact === null">
            <NavBarMobileMenu />
          </template>
        </template>
      </template>
      <template v-else>
        <NavBar />
      </template>
    </header>

    <!-- output the page content -->
    <div>
      <router-view />
    </div>

    <!-- footer -->
    <footer></footer>
  </div>
</template>

<style scoped>
header {
  position: fixed;
  top: 0;
  z-index: 999;
}
</style>
