import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/predict': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/predict-file': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
      '/features': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
    }
  }
})