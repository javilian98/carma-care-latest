<script setup>
import { defineProps, toRefs, ref } from 'vue'

import Avatar from 'primevue/avatar/Avatar.vue'
import Badge from 'primevue/badge/Badge.vue'

import { useChatStore } from '../../stores/chat'

const props = defineProps({
  avatarImage: String || null,
  contactName: String,
  lastMessage: String,
  lastMessageTime: String,
  lastMessageCount: Number
})

const chat = useChatStore()

const { avatarImage, contactName, lastMessage, lastMessageTime, lastMessageCount } = toRefs(props)
</script>

<template>
  <li
    class="chat-list-item"
    :class="{ 'selected-contact': contactName === chat.selectedContact?.username }"
  >
    <div class="chat-list-item-avatar">
      <Avatar v-if="avatarImage" :image="avatarImage" shape="circle" size="large" />
      <Avatar
        v-else
        :label="contactName?.[0]"
        shape="circle"
        size="large"
        style="background: var(--color-primary); color: white"
      />
    </div>
    <div class="chat-list-item-content">
      <div class="chat-list-item-content-top">
        <span class="chat-contact-name">{{ contactName }}</span>
        <span class="chat-last-message-time">{{ lastMessageTime }}</span>
      </div>
      <div class="chat-list-item-content-bottom">
        <span class="chat-last-message">{{ lastMessage }}</span>
        <span class="chat-last-message-count">
          <Badge :value="lastMessageCount" severity="warning"></Badge>
        </span>
      </div>
    </div>
  </li>
</template>

<style scoped>
.chat-list-item {
  background: #fff;
  padding: 10px;

  display: flex;
  align-items: start;
  gap: 10px;
  width: 100%;
  border-bottom: solid 1px #efefef;
  border-right: solid transparent;
  cursor: pointer;
  transition: 0.3s;
}

.chat-list-item:hover {
  background: #ffe6d6;
  /* opacity: 0.5; */
}

.chat-list-item.selected-contact {
  background: #ffdbc3;
  border-right: solid var(--color-primary);
  transition: 0.3s;
}

/*
<div class="chat-list-item-content">
    <div class="chat-list-item-content-top">
        <span class="chat-contact-name">list of chats</span>
        <span class="chat-last-message-time">09:10</span>
    </div>
    <div class="chat-list-item-content-bottom">
        <span class="chat-last-message">list of chats</span>
        <span class="chat-last-message-count">1</span>
    </div>
</div>
*/

.chat-list-item-content {
  width: 100%;
}

.chat-list-item-content-top,
.chat-list-item-content-bottom {
  display: flex;
  justify-content: space-between;
  width: 100%;
  gap: 10px;
}

.chat-list-item-content-top {
  margin-bottom: 4px;
}

.chat-contact-name {
  font-size: 1.05em;
}
.chat-last-message-time {
  font-size: 0.8em;
}

.chat-last-message {
  font-size: 0.8em;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  max-width: 225px;
  width: 100%;
}
</style>
