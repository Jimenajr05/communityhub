// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@vite-pwa/nuxt'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href:
            'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  runtimeConfig: {
    public: {
      // URL base de la API del backend (Express). Se sobreescribe con NUXT_PUBLIC_API_BASE.
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api',
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'CommunityHub',
      short_name: 'CommunityHub',
      description:
        'Plataforma comunitaria de actividades y eventos: regístrate, participa e inscríbete en actividades de tu comunidad.',
      start_url: '/',
      display: 'standalone',
      theme_color: '#0f172a',
      background_color: '#ffffff',
      icons: [
        {
          src: '/icons/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/icons/icon-512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: null,
      // Precachea el shell de la app para que funcione offline tras la primera visita.
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          // Como la app usa SSR (preset node-server), las páginas se generan
          // dinámicamente y no se pueden precachear como archivos estáticos.
          // Se cachean en tiempo de ejecución con NetworkFirst: usa la red si
          // hay conexión, y cae al caché si el usuario está offline.
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'communityhub-pages-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 60 * 60 * 24, // 1 día
            },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          // Cachea las respuestas GET de la API (p. ej. /api/events) para poder
          // consultar actividades previamente cargadas cuando el usuario está offline.
          urlPattern: ({ url, request }) =>
            request.method === 'GET' && url.pathname.startsWith('/api/'),
          handler: 'NetworkFirst',
          options: {
            cacheName: 'communityhub-api-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24, // 1 día
            },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
    devOptions: {
      // Permite probar el service worker también en modo desarrollo (npm run dev)
      enabled: true,
      type: 'module',
      suppressWarnings: true,
    },
  },
})