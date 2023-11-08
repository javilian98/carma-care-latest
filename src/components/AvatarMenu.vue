<script setup>
import { ref } from 'vue'

// router
import router from '../router'

// supabase
import { supabase } from '../lib/supabase'

// composables
import { useMatchMedia, screenSize } from '../composables/useMatchMedia'

// primevue
import Avatar from 'primevue/Avatar'
import Menu from 'primevue/Menu'
import Dialog from 'primevue/dialog'
import Button from 'primevue/Button'

// vue-toastification
import { useToast, POSITION } from 'vue-toastification'

// custom components
import NavCarmaCoins from './NavCarmaCoins.vue'

// stores
import { useUserStore } from '../stores/user'

const toast = useToast()
const user = useUserStore()
const modalVisible = ref(false)

const menu = ref()
const items = ref([
  {
    label: 'My Profile',
    icon: 'pi pi-user',
    command: () => {
      router.push({ path: `/profile/@${user.profile.handle}` })
    }
  },
  {
    label: 'My Giveaways',
    icon: 'pi pi-gift',
    command: () => {
      console.log('My Giveaways CLICKED')
    }
  },
  {
    label: 'My Requests',
    icon: 'pi pi-megaphone',
    command: () => {
      console.log('My Requests CLICKED')
    }
  },
  {
    label: 'Chatroom',
    icon: 'pi pi-comments',
    command: () => {
      router.push({ name: 'Chatroom' })
    }
  }
])

const toggle = (event) => {
  menu.value.toggle(event)
}

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.log(error)
  } else {
    console.log('Logout successfully')
    user.currentUser = null
    user.session = null
    user.profile = null
    router.push({ name: 'Login' })
    toast.success('Logged out successfully', {
      position: POSITION.TOP_CENTER,
      timeout: 2000
    })
  }
}

const donateCarma = async () => {
  const { data, error } = await supabase
    .from('userProfiles')
    .update({
      totalDonatedCarma: user.profile.totalDonatedCarma + user.profile.expiringCarma,
      expiringCarma: 0,
      currBalanceCarma: user.profile.currBalanceCarma - user.profile.expiringCarma
    })
    .match({ id: user.profile.id })

  if (error) {
    console.log('Error updating row:', error.message)
  } else {
    console.log('Updated row:', data)

    modalVisible.value = false
    toast.success('Successfully Donated Carma!', {
      position: POSITION.TOP_CENTER,
      timeout: 2000
    })

    user.profile = await user.fetchUserProfile()
  }
}

const tabletScreen = useMatchMedia(screenSize.tablet)
</script>

<template>
  <div class="nav-btns-avatar-menu">
    <div class="nav-btns-avatar" @click="toggle">
      <template v-if="user.profile?.avatarUrl">
        <Avatar :image="user.profile?.avatarUrl" size="medium" shape="circle" />
      </template>
      <template v-else-if="user.profile !== null">
        <Avatar
          :label="user.profile?.username.charAt(0).toUpperCase()"
          size="medium"
          shape="circle"
          style="background-color: #4caf4f; color: #fff"
        />
      </template>
      <template v-else>
        <Avatar icon="pi pi-user" size="medium" shape="circle" />
      </template>
      <div v-if="!tabletScreen">
        <span class="name">{{ user.profile?.username }}</span>
      </div>
    </div>

    <Menu ref="menu" :model="items" :popup="true">
      <template #start>
        <button
          class="w-full p-link flex flex-column justify-content-center p-2 pl-4 text-color hover:surface-200 border-noround"
        >
          <NavCarmaCoins :userCarma="String(user.profile ? user.profile.currBalanceCarma : 0)" />
          <div class="donate-text" @click="modalVisible = true">Donate Carma</div>
        </button>
        <div style="border-bottom: solid 1px #e2e2e2"></div>
      </template>
      <template #item="{ item, label, props }">
        <a class="flex" v-bind="props.action">
          <span v-bind="props.icon" />
          <span v-bind="props.label">{{ label }}</span>
          <!-- <Badge v-if="item.badge" class="ml-auto" :value="item.badge" /> -->
        </a>
      </template>
      <template #end>
        <div style="border-top: solid 1px #e2e2e2"></div>
        <button
          @click="handleLogout"
          class="w-full p-link flex align-items-center p-2 pl-4 text-color hover:surface-200 border-noround"
        >
          <i class="pi pi-sign-out text-red-500" />
          <span class="ml-2 text-red-500">Log Out</span>
        </button>
      </template>
    </Menu>
  </div>
  <Dialog
    class="preview-dialog"
    v-model:visible="modalVisible"
    modal
    header="Header"
    :style="{ width: '50rem' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
  >
    <template #header>
      <h3>Donating CarmaCoins</h3>
    </template>
    <p class="m-0">
      CarmaCoins earned have an expiration period of 1 month, and will be subtracted from your
      CarmaCoins at the end of every month.<br /><br />This feature allows you to donate all of your
      expiring CarmaCoins to other users in need that have been identified by our platform.<br /><br />You
      currently have <span class="donate-text">{{ user.profile?.expiringCarma }}</span> expiring
      CarmaCoins. Would you like to donate them now?
    </p>
    <template #footer>
      <Button label="Back" severity="secondary" icon="pi pi-times" @click="modalVisible = false" />
      <Button
        label="Donate Now!"
        severity="warning"
        icon="pi pi-gift"
        @click="donateCarma"
        autofocus
      />
    </template>
  </Dialog>
</template>

<style scoped>
.donate-text {
  color: var(--color-primary);
}

.donate-text:hover {
  text-decoration: underline;
}

.nav-btns-avatar {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.nav-btns-avatar .name {
  padding-left: 10px;
}

@media screen and (max-width: 1260px) {
  .nav-btns-avatar .name {
    display: none;
  }
}
</style>
