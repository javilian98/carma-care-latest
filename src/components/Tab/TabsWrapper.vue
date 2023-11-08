<script setup>
import { ref, provide, useSlots } from 'vue'

const slots = useSlots()

const tabs = ref(slots.default().map((tab) => tab.props))
const selectedTitle = ref(tabs.value[0].title)

const setSelectedTitle = (title) => {
  selectedTitle.value = title
}

provide('selectedTitle', selectedTitle)
</script>
<template>
  <div class="tabs">
    <ul class="tabs-header">
      <li
        v-for="tab in tabs"
        :key="tab.title"
        :class="{ 'selected-tab': tab.title === selectedTitle }"
        @click="setSelectedTitle(tab.title)"
      >
        <i class="text-2xl pi" :class="tab.icon"></i>
        <span>{{ tab.title }}</span>
      </li>
    </ul>
    <slot />
  </div>
</template>

<style scoped>
.tabs-header {
  display: flex;
  justify-content: center;
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.tabs-header li {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 170px;
  height: 65px;
  text-decoration: none;
  letter-spacing: 0.8px;
  color: #222;
  border-bottom: solid 3px transparent;
  cursor: pointer;
}

.tabs-header li.selected-tab {
  color: var(--color-primary);
  border-bottom: solid 3px var(--color-primary);
}
</style>
