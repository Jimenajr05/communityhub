# CommunityHub — Frontend

Aplicación web construida con **Nuxt 4 / Vue 3**, TypeScript y Pinia, consumida exclusivamente vía la API REST del backend (Express). El frontend nunca se conecta directamente a MongoDB.

## Estado de esta entrega

Esta primera entrega incluye únicamente:

- **Configuración de la herramienta frontend**: proyecto Nuxt 4 inicializado con TypeScript, `@pinia/nuxt` (store inicial `stores/auth.ts` y composable `useApi` para consumir la API) y estructura base según convención de Nuxt 4 (carpeta `app/`).
- **PWA inicial**: módulo `@vite-pwa/nuxt` configurado con:
  - **Web App Manifest** completo: `name`, `short_name`, `description`, `icons` (192/512/512 maskable), `start_url`, `display`, `theme_color`, `background_color`.
  - **Service Worker** (`generateSW`, `registerType: autoUpdate`) que precachea el shell de la aplicación y cachea las respuestas `GET /api/*` con estrategia `NetworkFirst`, para poder consultar información previamente cargada sin conexión.
  - Banner visual que indica claramente cuando el usuario está offline (`useOnlineStatus`).

Las páginas funcionales (login, registro, actividades, favoritos, dashboard, etc.) descritas en la sección 19 del documento del proyecto se implementarán en entregas posteriores.

## Estructura

```
frontend/
├── app/
│   ├── app.vue          # Root component (incluye banner offline)
│   ├── stores/
│   │   └── auth.ts      # Store inicial de Pinia
│   └── composables/
│       ├── useApi.ts           # Cliente para consumir la API del backend
│       └── useOnlineStatus.ts  # Detección de estado online/offline
├── public/
│   └── icons/            # Iconos del manifest PWA (placeholder)
├── nuxt.config.ts         # Configuración de Nuxt + Pinia + PWA
├── .env.example
├── package.json
└── README.md
```

## Instalación

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

La app arranca por defecto en `http://localhost:3000`. Asegúrate de que el backend esté corriendo (por defecto en `http://localhost:3000/api` según `.env.example`; ajusta los puertos si ambos coinciden).

## Verificar la PWA

```bash
npm run build
npm run preview
```

Al compilar se genera `sw.js` y `manifest.webmanifest` en `.output/public/`. Desde el navegador (Chrome DevTools → Application) puedes verificar el manifest, el service worker registrado, e instalar la app.

## Variables de entorno

- `NUXT_PUBLIC_API_BASE`: URL base de la API del backend. Ver `.env.example`.
