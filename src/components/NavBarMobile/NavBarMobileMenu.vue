<script setup>
import NavBarMobileMenuLinks from '@/components/NavBarMobile/NavBarMobileMenuLinks.vue'
</script>

<template>
  <div class="nav-bar-mobile">
    <NavBarMobileMenuLinks />
  </div>
</template>

<style scoped>
.nav-bar-mobile {
  background: white;
  box-shadow: 0 -3px 15px rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 65px;
  display: flex;
  justify-content: center;
}
</style>
