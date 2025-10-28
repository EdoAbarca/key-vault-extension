import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  server: {
    // Configure development server
    port: 5173,
    strictPort: false,
    hmr: {
      // Enable Hot Module Replacement overlay for errors
      overlay: true,
    },
  },
  build: {
    // Generate sourcemaps for better debugging
    sourcemap: true,
    rollupOptions: {
      input: {
        popup: 'index.html',
      },
    },
  },
})
