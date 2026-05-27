import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://project-1-event-management-and-tick.vercel.app',//http:lcoalhost:4000
        changeOrigin: true,
      }
    }
  }
})