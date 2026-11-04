import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base:'/',
  server: {
    proxy: {
      '/api': {
        target: 'https://quick-notes-w463.onrender.com',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'https://quick-notes-w463.onrender.com',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
