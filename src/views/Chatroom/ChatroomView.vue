<script setup>
import { ref, provide } from 'vue'

import ChatContactList from './ChatContactList.vue'
import ChatWindowHeader from './ChatWindowHeader.vue'
import ChatWindowMessages from './ChatWindowMessages.vue'
import ChatWindowInputField from './ChatWindowInputField.vue'

import { useChatStore } from '../../stores/chat'

const chat = useChatStore()

const chatWindowMessagesRef = ref(null)
provide('chatWindowMessagesRef', chatWindowMessagesRef)

console.log('selectedContact here ', chat.selectedContact)
</script>

<template>
  <div class="chatroom-container">
    <ChatContactList />

    <main class="chat-window">
      <template v-if="chat.selectedContact?.chat_id !== undefined">
        <ChatWindowHeader />
        <ChatWindowMessages />
        <ChatWindowInputField />
      </template>
      <template v-else>
        <div class="chat-window-placeholder">
          <div class="chat-window-placeholder-content">
            <img src="../../assets/images/chatroom_default.svg" alt="Default chat Illustration" />
            <span>Select a contact to chat with!</span>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.chatroom-container {
  padding-top: 65px;
  position: relative;

  --sidebar-width: 350px;
  --chat-header-height: 70px;
  --nav-height: 65px;
  --chat-text-field-height: 70px;
}

.chat-window {
  padding-top: 0;
  margin-left: var(--sidebar-width);
  position: relative;
  min-height: calc(100vh - var(--nav-height));
  width: calc(100% - var(--sidebar-width));
  overflow-y: auto;
}

.chat-window-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: inherit;
}

.chat-window-placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}
.chat-window-placeholder-content img {
  max-width: 500px;
  width: 100%;
}
.chat-window-placeholder-content span {
  font-size: 1.2em;
}

@media screen and (max-width: 768px) {
  .nav-mobile-header {
    display: none;
  }
  .nav-bar-mobile {
    display: none;
  }

  .chatroom-container {
    margin-top: 0;
  }

  .chat-window {
    margin-left: 0;

    width: 100%;
  }
}
</style>
