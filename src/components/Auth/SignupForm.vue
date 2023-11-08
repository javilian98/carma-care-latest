<script setup>
import { ref } from 'vue'
import { supabase } from '../../lib/supabase'
import router from '../../router'

import InputText from 'primevue/inputtext/InputText.vue'
import Password from 'primevue/password/Password.vue'
import Button from 'primevue/button/Button.vue'

// vue-toastification
import { useToast, POSITION } from 'vue-toastification'

const toast = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleSignUp = async () => {
  loading.value = true
  const { data, error } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  })

  if (error) {
    console.log(error)
    toast.error(error.message, {
      position: POSITION.TOP_CENTER,
      timeout: 2000
    })
  } else {
    console.log(data)
    router.push({ name: 'Login' })
    toast.success('Please check your email to verify your account', {
      position: POSITION.TOP_CENTER,
      timeout: false
    })
  }

  loading.value = false
}

const seeCurrentUser = async () => {
  const localUser = await supabase.auth.getSession()
  console.log(localUser)
}
</script>

<template>
  <form v-on:keyup.enter="handleSignUp" class="auth-container">
    <div class="input-container">
      <span class="p-float-label">
        <InputText v-model="email" class="w-full" />
        <label>Email</label>
      </span>

      <span class="p-float-label">
        <Password v-model="password" toggleMask>
          <template #header>
            <h6>Pick a password</h6>
          </template>
          <template #footer>
            <Divider />
            <p class="mt-2">Suggestions</p>
            <ul class="pl-2 ml-2 mt-0" style="line-height: 1.5">
              <li>At least one lowercase</li>
              <li>At least one uppercase</li>
              <li>At least one numeric</li>
              <li>Minimum 8 characters</li>
            </ul>
          </template>
        </Password>
        <label>Password</label>
      </span>

      <Button :disabled="loading" label="Sign up" severity="warning" @click="handleSignUp" />
      <div class="login-container">
        <span>Already have an account?</span>
        <Button
          label="Sign in"
          severity="warning"
          text
          link
          @click="router.push({ name: 'Login' })"
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

.login-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
