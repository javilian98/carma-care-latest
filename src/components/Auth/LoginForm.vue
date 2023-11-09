<script setup>
import { ref } from 'vue'

// router
import router from '../../router'

// supabase
import { supabase } from '../../lib/supabase'

// primevue
import InputText from 'primevue/inputtext/InputText.vue'
import Password from 'primevue/password/Password.vue'
import Button from 'primevue/button/Button.vue'

// vue-toastification
import { useToast, POSITION } from 'vue-toastification'

import { useUserStore } from '../../stores/user'

const toast = useToast()
const user = useUserStore()

const email = ref('')
const password = ref('')
const errorMessage = ref(null)

const handleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    console.log('Login Error: ', error)
    errorMessage.value = error.message

    toast.error(error.message, {
      position: POSITION.TOP_CENTER,
      timeout: 2000
    })

    email.value = ''
    password.value = ''
  } else {
    user.profile = await user.fetchUserProfile()
    if (user.profile === null) {
      router.push({ name: 'Create Profile' })
    } else {
      router.push({ name: 'Giveaways' })
    }

    toast.success('Logged in successfully', {
      position: POSITION.TOP_CENTER,
      timeout: 2000
    })
  }
}

const resetErrorMessage = () => {
  errorMessage.value = null
}

const seeCurrentUser = async () => {
  const localUser = await supabase.auth.getSession()
  console.log(localUser)
}
</script>

<template>
  <form v-on:keyup.enter="handleLogin" class="auth-container">
    <div v-if="errorMessage" class="error-message">*{{ errorMessage }}</div>
    <div class="input-container">
      <span class="p-float-label">
        <InputText @focus="resetErrorMessage" v-model="email" class="w-full" />
        <label>Email</label>
      </span>

      <span class="p-float-label">
        <!-- <Password @focus="resetErrorMessage" v-model="password" toggleMask /> -->
        <Password v-model="password" :feedback="false" toggleMask />
        <label>Password</label>
      </span>

      <Button label="Login" severity="warning" @click="handleLogin" />
      <div class="sign-up-container">
        <span>Don't have an account yet?</span>
        <Button
          label="Sign up now!"
          severity="warning"
          text
          link
          @click="router.push({ name: 'Signup' })"
        />
      </div>
    </div>
  </form>
</template>

<style scoped>
.auth-container {
  display: grid;
  place-content: center;
  min-height: 100vh;
}

.input-container {
  width: 100%;
  min-width: 380px;
  display: grid;
  gap: 30px;
}

.sign-up-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-message {
  color: red;
  text-align: center;
  margin-bottom: 20px;
}
</style>
