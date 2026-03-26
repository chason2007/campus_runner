import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['logo.png', 'robots.txt', 'apple-touch-icon.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}']
      }
    })
  ],
  build: {
    minify: 'esbuild'
  },
  esbuild: {
    // @ts-expect-error - drop is valid in esbuild but missing from current type definitions
    drop: ['console', 'debugger'],
  },
})
