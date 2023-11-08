import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', {
  state: () => {
    return {
      selectedContact: null,
      selectedListing: null,
      contactList: [],
      messages: [],
      notificationCount: 0
    }
  },
  actions: {
    async sendMessage(msg) {
      this.messages.push(msg)
      console.log('messsages: ', this.messages)
    },

    setContactList(contactListArr) {
      this.contactList = contactListArr
    }
    // Add a new action to update the contact list
    // updateContactList(newContactList) {
    //   this.contactList =
    // }
  }
})
