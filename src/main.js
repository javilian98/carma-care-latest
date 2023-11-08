import './assets/css/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 3rd-party libraries
import PrimeVue from 'primevue/config'
import Toast from 'vue-toastification'
// Import the CSS or use your own!
import 'vue-toastification/dist/index.css'

import '@egjs/vue3-flicking/dist/flicking.css'
import '@egjs/flicking-plugins/dist/arrow.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue)
app.use(Toast)

app.mount('#app')
