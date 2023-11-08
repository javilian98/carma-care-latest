<script setup>
import { ref } from 'vue'

import Avatar from 'primevue/avatar/Avatar.vue'
import Button from 'primevue/button/Button.vue'
import Menu from 'primevue/menu/Menu.vue'

import { useChatStore } from '../../stores/chat'

const chat = useChatStore()

const userActionsMenu = ref()
const userActions = ref([
  {
    label: 'Offer Help',
    icon: 'pi pi-thumbs-up',
    command: () => {
      console.log('Offer Help CLICKED')
    }
  },
  {
    label: 'Request Help',
    icon: 'pi pi-envelope',
    command: () => {
      console.log('Request Help CLICKED')
    }
  }
])

const toggleUserActions = (event) => {
  userActionsMenu.value.toggle(event)
}

console.log('selectedContact >>', chat.selectedContact)
</script>

<template>
  <div class="chat-window-header">
    <div class="chat-window-header-contact">
      <Button
        icon="pi pi-arrow-left"
        severity="warning"
        text
        rounded
        aria-label="User Actions"
        class="chat-back-btn"
        @click="chat.selectedContact = null"
      />
      <Avatar
        v-if="chat.selectedContact?.avatarUrl"
        shape="circle"
        size="large"
        :image="chat.selectedContact?.avatarUrl"
      />
      <Avatar v-else shape="circle" size="large" :label="chat.selectedContact?.username?.[0]" />
      <!-- <Avatar label="J" shape="circle" size="large" /> -->
      <span class="chat-window-header-contact-name"
        >{{ chat.selectedContact?.username }} /
        <router-link to="#" class="text-orange-500">Giveaway Title</router-link></span
      >
    </div>
    <div class="chat-window-header-user-actions">
      <Button
        icon="pi pi-ellipsis-v"
        severity="warning"
        text
        rounded
        aria-label="User Actions"
        @click="toggleUserActions"
      />
      <Menu ref="userActionsMenu" :model="userActions" :popup="true">
        <template #item="{ item, label, props }">
          <a class="flex" v-bind="props.action">
            <span v-bind="props.icon" />
            <span v-bind="props.label">{{ label }}</span>
            <Badge v-if="item.badge" class="ml-auto" :value="item.badge" />
          </a>
        </template>
        <template #end>
          <div style="border-top: solid 1px #e2e2e2"></div>
          <button
            class="w-full p-link flex align-items-center p-2 pl-4 text-red-500 hover:surface-200 border-noround"
          >
            <i class="pi pi-ban" />
            <span class="ml-2">Block User</span>
          </button>
        </template>
      </Menu>
    </div>
  </div>
</template>

<style scoped>
.chat-window-header {
  position: fixed;
  width: calc(100% - var(--sidebar-width));
  height: var(--chat-header-height);
  background: #fff;
  border-bottom: solid 1px #dbdbdb;
  padding: 10px;

  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-window-header-contact {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-back-btn {
  display: none;
}

@media screen and (max-width: 768px) {
  .chat-window-header {
    width: 100%;
  }

  .chat-back-btn {
    display: block;
  }
}
</style>
