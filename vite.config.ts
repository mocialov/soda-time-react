import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/soda-time-react/' : '/',
  server: {
    port: 5174,
    proxy: {
      '/api/tvmaze': {
        target: 'https://api.tvmaze.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tvmaze/, '')
      },
      '/api/yts': {
        target: 'https://yts.bz/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yts/, ''),
        secure: false
      }
    }
  }
}))
