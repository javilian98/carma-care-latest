<script setup>
import { onBeforeMount } from 'vue'

// supabase
import { supabase } from './lib/supabase'

// stores
import { useUserStore } from './stores/user'

const user = useUserStore()

onBeforeMount(() => {
  supabase.auth.getSession().then(async ({ data }) => {
    if (data.session !== null) {
      user.currentUser = data.session.user
      user.session = data.session
      user.profile = await user.fetchUserProfile()
    }
  })

  supabase.auth.onAuthStateChange(async (_, _session) => {
    if (_session !== null) {
      user.currentUser = _session.user
      user.session = _session
    }
  })
})
</script>

<template>
  <component :is="$route.meta.layout">
    <RouterView />
  </component>
</template>

<style scoped></style>
