<script setup>
import { ref, onMounted } from 'vue'
import ChatContactListItem from '../views/Chatroom/ChatContactListItem.vue'

import { renderAMPMTime } from '../util/helper'

import { supabase } from '../lib/supabase'
import { useUserStore } from '../stores/user'
import { useChatStore } from '../stores/chat'
import router from '../router'

const user = useUserStore()
const chat = useChatStore()

onMounted(() => {
  getUsersFromChat()
})

const getUsersFromChat = async () => {
  const { data, error } = await supabase
    .from('chatMessages')
    .select(
      'id, sender_id, recipient_id, listing_id, chat_id, message, timestamp, userProfiles(id, username, avatarUrl)'
    )
    // .eq('chat_id', '3d33e1be-ccb7-4e62-8902-57b6624706f5')
    .or(`sender_id.eq.${user.currentUser.id}, recipient_id.eq.${user.currentUser.id}`)
    .order('timestamp', { ascending: false })

  if (error) {
    console.log('error: ', error)
    // handle the error
  } else {
    // // Post-process to ensure only one record for each sender_id
    const uniqueSenderIds = [...new Set(data.map((item) => item.sender_id))]
    const uniqueRecords = uniqueSenderIds.map((senderId) => {
      return data.find((record) => record.sender_id === senderId)
    })

    const uniqueChatIds = [...new Set(data.map((item) => item.chat_id))]
    const uniqueChatRecord = uniqueChatIds.map((chatId) => {
      return data.find((record) => record.chat_id === chatId)
    })

    console.log('uniqueRecords:: ', uniqueRecords)

    console.log('Unique Chat Record: ', uniqueChatRecord)

    if (uniqueRecords.length > 1) {
      const chatContactListArr = uniqueRecords
        .map((contact) => {
          console.log('contact>> ', contact)
          if (contact.recipient_id === user.currentUser.id) {
            return {
              id: contact.userProfiles.id,
              chat_id: contact.chat_id,
              avatarUrl: contact.userProfiles?.avatarUrl || '',
              username: contact.userProfiles.username,
              // lastMessage: uniqueChatRecord[0].message,
              lastMessage: uniqueChatRecord.find((item) => item.chat_id === contact.chat_id)
                .message,
              lastMessageTime: renderAMPMTime(contact.timestamp),
              lastMessageCount: 1
            }
          }
        })
        .filter((item) => item != undefined)

      chat.contactList = chatContactListArr.filter((item) => item != undefined)
    } else {
      const { data: contactData, error: contactDataError } = await supabase
        .from('userProfiles')
        .select('*')
        .match({
          id:
            uniqueRecords[0].sender_id === user.currentUser.id
              ? uniqueRecords[0].recipient_id
              : uniqueRecords[0].sender_id
        })
        .single()

      if (contactDataError) {
        console.log('posterIdUserDataError: ', contactDataError)
      } else {
        const contactObj = {
          id: contactData.id,
          chat_id: uniqueRecords[0].chat_id,
          avatarUrl: contactData?.avatarUrl || '',
          username: contactData?.username,
          // lastMessage: uniqueChatRecord[0].message,
          lastMessage: uniqueChatRecord.find((item) => item.chat_id === uniqueRecords[0].chat_id)
            .message,
          lastMessageTime: renderAMPMTime(uniqueRecords[0].timestamp),
          lastMessageCount: 1
        }
        chat.contactList = [contactObj]
      }
    }
  }
}

const setSelectedContact = (id) => {
  chat.selectedContact = chat.contactList.find((contact) => contact?.id === id)
  console.log('selected contact: ', chat.selectedContact)

  router.push({ name: 'Chatroom' })
}
</script>

<template>
  <ChatContactListItem
    v-for="(contact, index) in chat.contactList"
    :key="index"
    :avatarImage="contact?.avatarUrl"
    :contactName="contact?.username"
    :lastMessage="contact?.lastMessage"
    :lastMessageTime="contact?.lastMessageTime"
    :lastMessageCount="contact?.lastMessageCount"
    @click="setSelectedContact(contact?.id)"
  />
</template>

<style scoped>
.chat-sidebar {
  position: fixed;
  width: var(--sidebar-width);
  height: calc(100vh - calc(--nav-height));
  background: #efefef;
}

.chat-list-search {
  background: #fff;
  border-right: solid 1px #dbdbdb;
  border-bottom: solid 1px #dbdbdb;
  height: var(--chat-header-height);
  padding: 10px;

  display: flex;
  align-items: center;
  position: sticky;
}

.chat-contact-list {
  overflow-y: auto;
  list-style-type: none;
  padding: 0;
  margin: 0;
  height: calc(100vh - (var(--nav-height) + var(--chat-header-height)));
}

@media screen and (max-width: 768px) {
  .chat-sidebar {
    display: none;
  }
}
</style>
