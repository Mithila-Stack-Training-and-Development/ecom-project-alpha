import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ShopEase',
        short_name: 'ShopEase',
        description: 'Your online shopping destination',
        theme_color: '#1D4ED8',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: '/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: '/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: '/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
        ],
        display: 'standalone',
        background_color: '#ffffff',
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});