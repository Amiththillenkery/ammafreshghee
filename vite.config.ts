import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    // Note: API calls go directly to backend now (auto-detected based on hostname)
    // No proxy needed - frontend automatically connects to correct backend IP
  }
})
