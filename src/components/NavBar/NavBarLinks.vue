<script setup></script>

<template>
  <nav class="nav-links">
    <ul>
      <li>
        <router-link to="/" :class="{ 'nav-link-active': $route.name === 'Giveaways' }">
          <i class="pi pi-gift" style="font-size: 1.5rem"></i>
          <span>Giveaways</span>
        </router-link>
      </li>
      <li>
        <router-link
          :to="{ name: 'Requests' }"
          :class="{ 'nav-link-active': $route.name === 'Requests' }"
        >
          <i class="pi pi-megaphone" style="font-size: 1.5rem"></i>
          <span>Requests</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.nav-links {
  display: flex;
  align-items: center;
  /* border: solid 1px red; */
}

.nav-links ul {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
  list-style-type: none;
  padding: 0;
}

.nav-links li {
  display: flex;
  align-items: center;
}
.nav-links li a {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 170px;
  height: 100%;
  text-decoration: none;
  letter-spacing: 0.8px;
  color: #222;
  border-bottom: solid 3px transparent;
}
.nav-links li a.nav-link-active {
  color: var(--color-primary);
  border-bottom: solid 3px var(--color-primary);
}

@media screen and (max-width: 940px) {
  .nav-links li a {
    width: 100px;
  }
  .nav-links li a span {
    display: none;
  }
}
</style>
