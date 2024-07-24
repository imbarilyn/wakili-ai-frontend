import './assets/main.css'
import './style.css'
import './assets/material-icons/material-icons.css'
import vue3GoogleLogin from 'vue3-google-login'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// const clientId = "384985078367-ik7frj4d56anp2equv4ci7qpqiej5mn8.apps.googleusercontent.com"

app.use(createPinia())
app.use(router)
app.use(vue3GoogleLogin, {
  clientId: import.meta.env.VITE_APP_GOOGLE_CLIENT_ID as string,
})


app.mount('#app')
