# CommunityHub — Plataforma Comunitaria de Actividades y Eventos

Plataforma comunitaria completa de actividades y eventos. Permite a los usuarios registrarse, crear y administrar actividades, inscribirse en eventos, marcar favoritos, recibir notificaciones y consultar estadísticas mediante un dashboard adaptativo según su rol.

Proyecto desarrollado para el curso de **Aplicaciones Web Utilizando Software Libre** — Universidad Técnica Nacional (UTN), Sede Regional de San Carlos.

---

## Stack Tecnológico

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, Cors, `dotenv`.
- **Frontend**: Nuxt 4, Vue 3, TypeScript, Pinia, Vanilla CSS.
- **Serverless / Cloud**: AWS Lambda + AWS EventBridge (Procesador automático de notificaciones/recordatorios).
- **PWA**: Progressive Web App con `@vite-pwa/nuxt`, Web App Manifest, Service Worker y banner/modo offline.
- **Licencia**: Open Source ([MIT](LICENSE)).

---

## Estructura del Repositorio

```
communityhub/
├── backend/            # API REST con Express.js + Mongoose
│   ├── src/
│   │   ├── config/     # Configuración de base de datos MongoDB
│   │   ├── controllers/# Controladores HTTP (Auth, Eventos, Categorías, Inscripciones, etc.)
│   │   ├── middleware/ # Middleware de autenticación JWT, roles y errores
│   │   ├── models/     # Modelos Mongoose (User, Event, Category, Registration, Favorite, Notification)
│   │   ├── routes/     # Enrutador REST Express
│   │   ├── services/   # Lógica de negocio
│   │   └── utils/      # Seed de base de datos y utilidades JWT/Errores
│   ├── package.json
│   └── .env
├── frontend/           # Aplicación Nuxt 4 / Vue 3
│   ├── app/
│   │   ├── components/ # Componentes (EventCard, AuthPosterPanel, OfflineBanner)
│   │   ├── pages/      # Páginas (Inicio, Login, Registro, Actividades, Detalle)
│   │   ├── stores/     # Stores Pinia (Auth, Events)
│   │   └── composables/# Composables (useApi, useOnlineStatus, useCategoryStyle)
│   ├── nuxt.config.ts  # Configuración Nuxt & PWA
│   └── package.json
├── lambda/             # Función AWS Lambda (Procesamiento serverless de recordatorios)
│   ├── index.js        # Handler de Lambda
│   └── README.md       # Documentación de despliegue en AWS EventBridge
├── docs/               # Documentación adicional de arquitectura
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

---

## Roles de Usuario y Permisos

| Rol | Permisos Principales |
|---|---|
| **Administrador (`admin`)** | Gestión global de usuarios, actividades, categorías y métricas de plataforma. |
| **Organizador (`organizer`)** | Creación, edición y cancelación de sus propias actividades y consulta de participantes. |
| **Usuario (`user`)** | Consulta de actividades, inscripción, cancelación, marcado de favoritos y perfil. |

---

## Guía de Instalación y Ejecución Local

### 1. Requisitos Previos
- **Node.js**: v18.x o v20.x
- **MongoDB**: Instancia local corriendo en `mongodb://localhost:27017` o URI de MongoDB Atlas.

### 2. Backend (Express.js)

```bash
cd backend
npm install

# (Opcional) Copiar variables de entorno
cp ../.env.example .env

# Poblar la base de datos con usuarios y datos de prueba
npm run seed

# Iniciar servidor en modo desarrollo (Puerto 4000 por defecto)
npm run dev
```

> **Usuarios de prueba generados por `npm run seed`**:
> - **Admin**: `admin@communityhub.com` / `password123`
> - **Organizador**: `organizer@communityhub.com` / `password123`
> - **Usuario**: `user@communityhub.com` / `password123`

### 3. Frontend (Nuxt 4)

```bash
cd frontend
npm install

# Iniciar servidor de desarrollo de Nuxt
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

---

## Resumen de Endpoints de la API REST (`/api`)

| Método | Endpoint | Descripción | Autenticación |
|---|---|---|---|
| `POST` | `/api/auth/register` | Registro de usuario | Pública |
| `POST` | `/api/auth/login` | Inicio de sesión (JWT) | Pública |
| `GET` | `/api/auth/me` | Obtener usuario autenticado | Bearer Token |
| `POST` | `/api/auth/logout` | Cierre de sesión | Bearer Token |
| `GET` | `/api/events` | Listar actividades con búsqueda y filtros | Pública |
| `GET` | `/api/events/:id` | Detalle de una actividad | Pública |
| `POST` | `/api/events` | Crear actividad | Organizador / Admin |
| `PUT` | `/api/events/:id` | Actualizar actividad propia | Organizador / Admin |
| `DELETE` | `/api/events/:id` | Eliminar/Cancelar actividad propia | Organizador / Admin |
| `POST` | `/api/events/:id/register` | Inscribirse a actividad | Autenticado |
| `DELETE` | `/api/events/:id/register` | Cancelar inscripción | Autenticado |
| `POST` | `/api/events/:id/favorite` | Guardar en favoritos | Autenticado |
| `DELETE` | `/api/events/:id/favorite` | Quitar de favoritos | Autenticado |
| `GET` | `/api/categories` | Listar categorías | Pública |
| `GET` | `/api/dashboard` | Obtener métricas y dashboard por rol | Autenticado |
| `GET` | `/api/notifications` | Listar notificaciones del usuario | Autenticado |

---

## Autoras

- **María Jimena Jara Rojas**
- **Fernanda Sibaja Campos**

## Licencia

Este proyecto se distribuye bajo la licencia [MIT](LICENSE).