/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages sirve el proyecto en https://<usuario>.github.io/Irregular-verbs/
const BASE = '/Irregular-verbs/';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      workbox: {
        // Solo las letras latinas de las fuentes: el resto de alfabetos no se usa.
        globPatterns: ['**/*.{js,css,html}', '**/*-latin-wght-normal-*.woff2'],
      },
      manifest: {
        name: 'Verbos irregulares',
        short_name: 'Verbos',
        description: 'Aprende los verbos irregulares en inglés con repetición espaciada.',
        lang: 'es',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'any',
        background_color: '#f4f1ff',
        theme_color: '#6c4cf5',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
});
