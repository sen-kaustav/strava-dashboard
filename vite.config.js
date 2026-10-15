import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// base './' keeps asset URLs relative, so the same build works at
// http://localhost:5173/ and at https://<user>.github.io/<repo>/.
export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/icon.svg'],
      manifest: {
        name: 'Strava Dashboard',
        short_name: 'Strava',
        description: 'Personal run and swim dashboard built from Strava data.',
        theme_color: '#fff8f1',
        background_color: '#fff8f1',
        display: 'standalone',
        orientation: 'portrait',
        start_url: './',
        scope: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // The CSV is not precached: always try the network first so a refreshed
        // data file shows up on the next open, and fall back to the last copy offline.
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith('/data/activities.csv'),
            handler: 'NetworkFirst',
            options: { cacheName: 'strava-data', networkTimeoutSeconds: 4 }
          }
        ]
      }
    })
  ]
});
