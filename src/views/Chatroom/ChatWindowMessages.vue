<script setup>
import { onMounted, watchEffect, inject } from 'vue'

import Avatar from 'primevue/Avatar'

import { renderAMPMTime } from '../../util/helper'

import { useRoute } from 'vue-router'
import { useChatStore } from '../../stores/chat'
import { useUserStore } from '../../stores/user'
import { supabase } from '../../lib/supabase'

const chatWindowMessagesRef = inject('chatWindowMessagesRef')

const route = useRoute()
const user = useUserStore()
const chat = useChatStore()
let notificationSound = null

console.log('chat selectedContact ', chat.selectedContact)

const getSenderMessageAvatar = (senderId) => {
  console.log('senderId ', senderId)
  if (senderId === chat.selectedContact.id) {
    return chat.selectedContact.avatarUrl
  }
  if (senderId === user.currentUser.id) {
    return user.profile.avatarUrl
  }
  return null
}

onMounted(() => {
  notificationSound = new Audio('src/assets/audio/notification.mp3')
  watchEffect(() => {
    if (chat.selectedContact) {
      console.log('Getting message')
      getMessages()
    }
  })
})

onMounted(() => {
  watchEffect(() => {
    if (chat.messages.length) {
      chatWindowMessagesRef.value.scrollTop = chatWindowMessagesRef.value.scrollHeight
    }
  })
})

const getMessages = async () => {
  const { data, error } = await supabase
    .from('chatMessages')
    .select('*')
    .eq('chat_id', chat.selectedContact.chat_id)
    // .eq('chat_id', '3d33e1be-ccb7-4e62-8902-57b6624706f5')
    // .or(`sender_id.eq.${chat.selectedContact.id}, recipient_id.eq.${chat.selectedContact.id}`)
    .order('timestamp', { ascending: true })

  if (error) {
    console.log('error: ', error)
    // handle the error
  } else {
    console.log('messages: ', data)
    chat.messages = data.map((message) => {
      console.log('msg senderId: ', message.sender_id)
      console.log('msg currentUserId: ', user.currentUser.id)
      return {
        id: message.id,
        chat_id: message.chat_id,
        senderId: message.sender_id,
        recipientId: message.recipient_id,
        listingId: message.listing_id,
        message: message.message,
        timestamp: message.timestamp
      }
    })

    const messages = supabase
      .channel('chat-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chatMessages' },
        (payload) => {
          console.log('payload: ', payload.new)
          chat.messages.push({
            id: payload.new.id,
            chat_id: payload.new.chat_id,
            senderId: payload.new.sender_id,
            recipientId: payload.new.recipient_id,
            listingId: payload.new.listing_id,
            message: payload.new.message,
            timestamp: payload.new.timestamp
          })

          // chat.contactList = chat.contactList.filter(
          //   (contact) => contact.chat_id !== payload.new.chat_id
          // )

          // console.log('new chat.contactList: ', chat.contactList)

          if (route.name !== 'Chatroom') {
            console.log('route.name ', route.name)
            notificationSound.play()
            chat.notificationCount++
          }

          const recipientContactId = chat.contactList
            .filter((contact) => contact.chat_id === payload.new.chat_id)
            .pop()?.id

          const recipientContact = chat.contactList.find(
            (contact) => recipientContactId === contact.id
          )
          const updatedChatContactListItem = {
            id: payload.new.id,
            chat_id: payload.new.chat_id,
            avatarUrl: recipientContact?.avatarUrl || '',
            username: recipientContact?.username,
            // lastMessage: uniqueChatRecord[0].message,
            lastMessage: payload.new.message,
            lastMessageTime: renderAMPMTime(payload.new.timestamp),
            lastMessageCount: chat.notificationCount
          }

          const filterOldChatList = chat.contactList.filter(
            (contact) => contact.chat_id !== payload.new.chat_id
          )

          // Combine the filtered list with the updated contact item
          const newContactList = [updatedChatContactListItem, ...filterOldChatList]
          chat.setContactList(newContactList)

          console.log('newContactList ', chat.contactList)
        }
      )
      .subscribe()

    console.log('chat messages: ', chat.messages)
  }
}
</script>

<template>
  <div v-if="chat.selectedContact" class="chat-window-message-content" ref="chatWindowMessagesRef">
    <template v-for="(message, index) in chat.messages" :key="index">
      <div
        class="message-content-container"
        :class="{ right: message.senderId === user.currentUser.id }"
      >
        <div class="timestamp" :class="{ right: message.senderId === user.currentUser.id }">
          {{ renderAMPMTime(message.timestamp) }}
        </div>
        <div class="message-container" :class="{ right: message.senderId === user.currentUser.id }">
          <Avatar
            v-if="getSenderMessageAvatar(message.senderId)"
            class="avatar-img"
            shape="circle"
            :image="getSenderMessageAvatar(message.senderId)"
          />
          <Avatar
            v-else
            :label="chat.selectedContact.username[0]"
            size="medium"
            shape="circle"
            style="background-color: #4caf4f; color: #fff"
          />
          <div
            class="message-content"
            :class="
              message.senderId === user.currentUser.id ? 'sender-message' : 'recipient-message'
            "
          >
            {{ message.message }}
          </div>
        </div>
      </div>
      <!-- <div v-if="message.senderId === user.currentUser.id" class="message-content-container right">
        <Avatar
          v-if="getSenderMessageAvatar(user.currentUser.id)"
          shape="circle"
          :image="getSenderMessageAvatar(user.currentUser.id)"
        />
        <Avatar
          v-else
          :label="user.profile.username[0]"
          size="medium"
          shape="circle"
          style="background-color: #4caf4f; color: #fff"
        />
        <div class="sender-message">
          {{ message.message }}
        </div>
      </div>
      <div
        v-else-if="message.senderId === chat.selectedContact.id"
        class="message-content-container left"
      >
        <Avatar
          v-if="getSenderMessageAvatar(chat.selectedContact.id)"
          shape="circle"
          :image="getSenderMessageAvatar(chat.selectedContact.id)"
        />
        <Avatar
          v-else
          label="abc"
          size="medium"
          shape="circle"
          style="background-color: #4caf4f; color: #fff"
        />
        <div class="recipient-message">
          {{ message.message }}
        </div>
      </div> -->
    </template>
  </div>
  <!-- <div v-else class="chat-window-message-content">abcd</div> -->
</template>

<style scoped>
.chat-window-message-content {
  margin-top: var(--chat-header-height);
  padding: 20px;
  overflow-y: auto;
  height: calc(
    100vh - (var(--nav-height) + var(--chat-header-height) + var(--chat-text-field-height))
  );

  display: inline-flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.message-content-container {
  /* display: inline-flex;
  height: fit-content;
  align-items: center;
  gap: 10px; */
  display: flex;
  height: fit-content;
  flex-direction: column;
}

.message-container {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.message-container.right {
  justify-content: right;
  flex-direction: row-reverse;
}
.timestamp {
  font-size: 0.85em;
}
.timestamp.right {
  text-align: right;
}

.recipient-message {
  word-wrap: break-word;
  padding: 10px 20px;
  max-width: 80%;
  width: fit-content;
  border-radius: 100px;
  background: #efefef;
  justify-content: left;
  box-shadow: 0 10px 20px rgb(153 153 153 / 30%);
}

.sender-message {
  word-wrap: break-word;
  max-width: 80%;
  width: fit-content;
  padding: 10px 20px;
  border-radius: 100px;
  background: var(--color-primary);
  color: #fff;
  justify-content: right;
  box-shadow: 0 7px 30px rgba(244, 133, 58, 0.5);
}
</style>
