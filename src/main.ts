import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { startKeepAlive } from './utils/keepAlive'

createApp(App).mount('#app')

// Start backend keep-alive service
startKeepAlive()

