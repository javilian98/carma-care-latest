<template>
  <div class="logo">
    <router-link to="/">
      <div>
        <img :src="Logo" alt="" />
        <span>Carma Care</span>
      </div>
      <!-- <div class="text-orange-500">Carma Care</div> -->
    </router-link>
  </div>
</template>

<script setup>
import Logo from '@/assets/images/logo.png'
</script>

<style scoped>
.logo {
  display: block;
}

.logo a {
  text-decoration: none;
}

.logo div {
  display: flex;
  align-items: center;
  color: var(--color-primary);
}

.logo img {
  width: 65px;
  height: auto;
  padding: 10px;
}

@media screen and (max-width: 768px) {
  .logo span {
    display: none;
  }
}
</style>
