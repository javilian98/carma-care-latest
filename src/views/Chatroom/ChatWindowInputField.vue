<script setup>
import { ref, defineProps, toRefs, nextTick, inject } from 'vue'

import InputText from 'primevue/inputtext/InputText.vue'
import Button from 'primevue/button/Button.vue'

import { useUserStore } from '../../stores/user'
import { useChatStore } from '../../stores/chat'
import { useToast, POSITION } from 'vue-toastification'

import { supabase } from '../../lib/supabase'

const chatWindowMessagesRef = inject('chatWindowMessagesRef')

const user = useUserStore()
const chat = useChatStore()
const toast = useToast()

const messageTextInput = ref('')

const handleSendMessage = async () => {
  if (messageTextInput.value === '') return

  chat.selectedContact.lastMessage = messageTextInput.value

  nextTick(() => {
    if (chatWindowMessagesRef.value) {
      chatWindowMessagesRef.value.scrollTop = chatWindowMessagesRef.value.scrollHeight
    }
  })

  console.log('profile created')
  // Fetch the chat id
  const { data: messageFromSelectedContact, error: messageFromSelectedContactError } =
    await supabase
      .from('chatMessages')
      .select(
        'id, sender_id, recipient_id, listing_id, chat_id, message, timestamp, userProfiles(id, username, avatarUrl)'
      )
      .eq('chat_id', chat.selectedContact.chat_id)
      .limit(1)
      .single()

  console.log('chat messages input: ', messageFromSelectedContact)

  // Insert into supabase
  const { error } = await supabase.from('chatMessages').insert({
    sender_id: user.currentUser.id,
    recipient_id: chat.selectedContact?.id,
    listing_id: messageFromSelectedContact.listing_id,
    chat_id: chat.selectedContact?.chat_id,
    message: messageTextInput.value
  })

  if (error) {
    console.log('create profile: ', error)
    toast.error(error.message, {
      position: POSITION.TOP_CENTER,
      timeout: 2000
    })
    return
  }

  // Insert into UI
  // chat.sendMessage({
  //   sender_id: user.currentUser.id,
  //   recipient_id: chat.selectedContact?.id,
  //   listing_id: messageFromSelectedContact.listing_id,
  //   chat_id: chat.selectedContact?.chat_id,
  //   message: messageTextInput.value
  // })

  messageTextInput.value = ''
}
</script>

<template>
  <div class="chat-window-input-field">
    <InputText
      v-model="messageTextInput"
      @keydown.enter="handleSendMessage"
      type="text"
      size="small"
      placeholder="Say something"
      class="w-full"
    />
    <Button icon="pi pi-send" severity="warning" rounded aria-label="Notification" />
  </div>
</template>

<style scoped>
.chat-window-input-field {
  position: fixed;
  bottom: 0;
  border-top: solid 1px #dbdbdb;
  width: inherit;
  padding: 10px;

  display: flex;
  gap: 10px;
}
</style>
