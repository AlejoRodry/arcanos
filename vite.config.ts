import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const githubRepo = process.env.GITHUB_REPOSITORY
    ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
    : '/arcanos/';
  
  const rawBase = process.env.BASE_PATH || (isDev ? '/' : githubRepo);
  const basePath = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'tts-api-server',
        configureServer(server) {
          server.middlewares.use('/api/tts', async (req, res) => {
            try {
              const url = new URL(req.url || '', 'http://localhost');
              const text = url.searchParams.get('text');
              if (!text) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Text parameter required' }));
                return;
              }

              const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=es&client=tw-ob&q=${encodeURIComponent(text)}`;
              const response = await fetch(ttsUrl);
              if (!response.ok) {
                res.statusCode = response.status;
                res.end('Failed to fetch TTS');
                return;
              }

              res.setHeader('Content-Type', 'audio/mpeg');
              res.setHeader('Cache-Control', 'public, max-age=86400');
              const buffer = await response.arrayBuffer();
              res.end(Buffer.from(buffer));
            } catch (err) {
              console.error('TTS middleware error:', err);
              res.statusCode = 500;
              res.end('TTS error');
            }
          });
        }
      },
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'pwa-maskable-512x512.png'],
        manifest: {
          id: basePath,
          name: 'Arcanos: Lectura Cinemática',
          short_name: 'Arcanos',
          description: 'Oráculo cinemático y poético de los 26 Arcanos con recitación en off.',
          theme_color: '#050B14',
          background_color: '#02060F',
          display: 'standalone',
          orientation: 'portrait',
          start_url: basePath,
          scope: basePath,
          lang: 'es',
          categories: ['entertainment', 'lifestyle', 'books'],
          icons: [
            {
              src: `${basePath}pwa-192x192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${basePath}pwa-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${basePath}pwa-maskable-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true, // Enables service worker in development and AI Studio preview
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'motion/react', 'lucide-react'],
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
