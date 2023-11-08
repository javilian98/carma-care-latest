<script setup>
import { ref, provide, useSlots } from 'vue'

import Button from 'primevue/button/Button.vue'
import Avatar from 'primevue/Avatar'

const slots = useSlots()

const tabs = ref(slots.default().map((tab) => tab.props))
const selectedTitle = ref(tabs.value[0].title)

const setSelectedTitle = (title) => {
  selectedTitle.value = title
}

provide('selectedTitle', selectedTitle)
</script>

<template>
  <section class="stepper">
    <ul class="stepper-header">
      <li v-for="(tab, index) in tabs" :key="tab.title" @click="setSelectedTitle(tab.title)">
        <Button link :class="{ 'selected-step': tab.title === selectedTitle }">
          <Avatar
            :label="index + 1"
            class="step-number"
            :class="{ 'selected-step-number': tab.title === selectedTitle }"
            shape="circle"
          />
          <span>{{ tab.title }}</span>
        </Button>
      </li>
    </ul>
    <slot />
  </section>
</template>

<style scoped>
.stepper-header {
  display: flex;
  list-style-type: none;
  padding: 0;
}

.stepper-header button {
  display: flex;
  flex-direction: column;
  color: #bbbbbb;
}

.stepper-header button .step-number {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.stepper-header button.selected-step {
  color: var(--color-primary);
}

.stepper-header .step-number.selected-step-number {
  color: #fff;
  background: var(--color-primary);
}
</style>
