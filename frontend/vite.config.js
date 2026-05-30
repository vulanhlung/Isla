import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // base mặc định '/' — đúng khi Express serve cùng domain
  base: '/',
  server: {
    port: 5173,
    // Dev: proxy /api sang Express backend
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
