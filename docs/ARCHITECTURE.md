# Arquitectura

## Visión general

```
                ┌──────────────────────┐
                │   Frontend (PWA)     │
                │  Nuxt 4 + Vue 3      │
                │  + Pinia + Service   │
                │    Worker (Workbox)  │
                └──────────┬───────────┘
                           │ fetch/$fetch (HTTPS)
                           │ JWT en header Authorization
                           ▼
                ┌──────────────────────┐
                │   Backend (API REST) │
                │  Express.js          │
                │  Controllers/Services│
                │  Middlewares (auth,  │
                │  roles, errores)     │
                └──────────┬───────────┘
                           │ Mongoose
                           ▼
                ┌──────────────────────┐
                │      MongoDB         │
                │  users, events,      │
                │  categories,         │
                │  registrations,      │
                │  favorites,          │
                │  notifications       │
                └──────────┬───────────┘
                           ▲
                           │ conexión directa (mismo URI)
                ┌──────────┴───────────┐
                │   AWS Lambda         │
                │  (recordatorios de   │
                │   actividades)       │
                └──────────┬───────────┘
                           ▲
                           │ regla programada (cada 6h)
                ┌──────────┴───────────┐
                │   AWS EventBridge    │
                └──────────────────────┘
```

## Componentes

### Frontend — `frontend`
- **Nuxt 4 / Vue 3** con SSR (preset `node-server`).
- **Pinia** para el estado global (`auth`, `events`, `notifications`).
- Consume **exclusivamente** la API del backend a través del composable `useApi.ts` (nunca accede a MongoDB directamente).
- **PWA** vía `@vite-pwa/nuxt`: Web App Manifest + Service Worker (Workbox) con estrategia `NetworkFirst` tanto para las páginas navegables como para las respuestas `GET /api/*`, lo que permite consultar actividades previamente cargadas sin conexión. Componente `OfflineBanner.vue` informa visualmente el estado offline.

### Backend — `backend`
- **Express.js** con arquitectura en capas: `routes → controllers → services → models`.
- **Mongoose** como ODM sobre MongoDB.
- **JWT** para autenticación y middlewares `authenticate` / `authorize(...roles)` para autorización basada en rol.
- Manejo centralizado de errores (`error.middleware.js` + `ApiError.js`) que evita filtrar errores internos de MongoDB al cliente.
- Subida de imágenes (avatar de perfil, imagen de evento) vía `multer`.

### Base de datos — MongoDB
Colecciones: `users`, `events`, `categories`, `registrations`, `favorites`, `notifications`.

### Serverless — `lambda`
- Función Lambda que se conecta directamente a la misma base MongoDB del backend (comparte `MONGODB_URI`).
- Disparada periódicamente por una regla de **AWS EventBridge** (cada 6 horas, ver [`setup_eventbridge.js`](../lambda/setup_eventbridge.js)).
- Detalle completo del flujo en [LAMBDA.md](./LAMBDA.md).

## Flujo de datos — ejemplo (inscripción + notificación)

1. Usuario autenticado hace `POST /api/events/:id/register` desde el frontend.
2. El backend valida (evento existe, hay cupo, no está inscrito ya) y crea el registro en `registrations`.
3. Periódicamente, EventBridge dispara la Lambda.
4. La Lambda busca eventos activos que ocurren en las próximas 24h y, por cada inscripción confirmada, crea una notificación en la colección `notifications` (si no existe una previa para ese evento/usuario).
5. El usuario consulta `GET /api/notifications` desde el frontend y ve el recordatorio.
