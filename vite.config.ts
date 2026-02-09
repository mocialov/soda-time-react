import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
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
  },
  define: {
    'process.env': {},
    'process.version': JSON.stringify('v18.0.0'),
    'process.platform': JSON.stringify('browser'),
    global: 'globalThis'
  },
  resolve: {
    alias: {
      process: 'process/browser',
      buffer: 'buffer',
      stream: 'stream-browserify',
      util: 'util/',
      path: 'path-browserify',
      events: 'events',
      crypto: 'crypto-browserify',
      fs: path.resolve(__dirname, './src/stubs/fs.ts'),
      os: path.resolve(__dirname, './src/stubs/os.ts')
      // Removed bittorrent-dht stub for Electron Node.js support
    }
  },
  optimizeDeps: {
    include: ['util'],
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  }
})
