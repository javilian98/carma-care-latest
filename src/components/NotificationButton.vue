<script setup>
import { ref } from 'vue'
import Button from 'primevue/button/Button.vue'
import OverlayPanel from 'primevue/overlaypanel/OverlayPanel.vue'
import NotificationList from './NotificationList.vue'
import Badge from 'primevue/badge/Badge.vue'

import { useChatStore } from '../stores/chat'

const chat = useChatStore()

const notificationMenu = ref()

const toggleNotification = (event) => {
  notificationMenu.value.toggle(event)
  chat.notificationCount = 0
}
</script>

<template>
  <div class="nav-bar-notification">
    <Badge
      v-if="chat.notificationCount > 0"
      class="notification-badge"
      :value="chat.notificationCount"
      severity="danger"
    />
    <Button
      icon="pi pi-bell"
      severity="warning"
      rounded
      outlined
      aria-label="Notification"
      @click="toggleNotification"
    />
  </div>
  <OverlayPanel ref="notificationMenu">
    <div class="notification-container">
      <p>Chat Notifications</p>
      <NotificationList />
    </div>
  </OverlayPanel>
</template>

<style scoped>
.nav-bar-notification {
  display: flex;
  justify-content: right;
  position: relative;
}

.notification-badge {
  position: absolute;
  right: 2px;
  top: 2px;
  z-index: 1;
  scale: 0.75;
}

.notification-container p {
  margin-bottom: 15px;
  font-weight: 500;
}
</style>
