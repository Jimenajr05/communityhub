# 🎟️ CommunityHub — Frontend

Aplicación web moderna y progresiva (**PWA**) para la gestión y participación en actividades comunitarias y eventos. Construida con **Nuxt 4 / Vue 3**, **TypeScript** y **Pinia**, consumida exclusivamente a través de la API REST del backend (Express.js).

---

## 🌟 Características Principales

### 1. Autenticación y Autorización
* **Registro e Inicio de Sesión:** Validación reactiva de formularios y almacenamiento de JWT mediante cookies y store de Pinia.
* **Control de Acceso por Roles (RBAC):** Middleware para rutas protegidas según el tipo de usuario (`usuario`, `organizador`, `administrador`).

### 2. Gestión de Actividades (Eventos)
* **Exploración y Búsqueda:** Filtros dinámicos por categoría, fecha, disponibilidad y texto libre.
* **Detalle de Actividad:** Información de cupos en tiempo real, mapa/ubicación, organizador y etiquetas de estado (`activa`, `cancelada`, `finalizada`).
* **Inscripción y Cancelación:** Reserva de cupos inmediata con actualización reactiva.
* **Favoritos:** Guardado de actividades favoritas con acceso rápido desde el panel.

### 3. Paneles por Rol
* **Dashboard Adaptable:**
  * **Usuario:** Contador de inscripciones, próximas actividades, favoritos y notificaciones sin leer.
  * **Organizador:** Métricas de eventos creados, estado de actividades y participantes totales.
  * **Administrador:** Estadísticas globales de la plataforma.
* **Gestión del Organizador (`/mis-actividades`):**
  * Creación y edición de actividades.
  * Cancelación y eliminación de eventos.
  * **Visualización de Participantes:** Modal con el listado completo de usuarios inscritos por actividad.
* **Panel de Administración (`/admin`):**
  * Gestión y cambio de roles de usuarios.
  * Moderación global de actividades.
  * Creación y administración de categorías.
  * Reporte de estadísticas generales.

### 4. Centro de Notificaciones (`/notificaciones`)
* Consulta de avisos en tiempo real y recordatorios serverless (generados por AWS Lambda).
* Pestañas para filtrar por estado (*Todas* / *Sin leer*) y botón para marcar todas como leídas.
* Badge dinámico en la barra de navegación con el conteo de avisos pendientes.

### 5. Progressive Web App (PWA) & Modo Offline
* **Instalable:** Web App Manifest completo (`manifest.webmanifest`) con soporte para modo *standalone* e iconos adaptables (192x192 y 512x512).
* **Service Worker con Workbox:**
  * Precacheo del shell de la aplicación.
  * Estrategia `NetworkFirst` para almacenar en caché las páginas visitadas y respuestas de la API (`GET /api/*`).
* **Indicador Offline:** Banner sticky reactivo (`OfflineBanner.vue` + `useOnlineStatus`) que alerta al usuario cuando pierde conexión a Internet y permite continuar consultando información precargada.

---

## 🛠️ Tecnologías Utilizadas

* **Framework:** [Nuxt 4](https://nuxt.com/) (Vue 3 + Composition API + Script Setup)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
* **Gestor de Estado:** [Pinia](https://pinia.vuejs.org/) (`@pinia/nuxt`)
* **PWA & Service Worker:** [`@vite-pwa/nuxt`](https://vite-pwa-org.netlify.app/)
* **Estilos:** CSS Vanilla estructurado con variables y tokens de diseño (`assets/css/main.css`).

---

## 📁 Estructura del Proyecto

```
communityhub-frontend/
├── app/
│   ├── app.vue                   # Componente raíz (Shell, PWA Manifest, OfflineBanner, AppHeader)
│   ├── assets/
│   │   └── css/
│   │       └── main.css          # Tokens de diseño, tipografías y estilos globales
│   ├── components/
│   │   ├── AdminNav.vue          # Navegación del panel de administración
│   │   ├── AppHeader.vue         # Barra de navegación global con badge de notificaciones
│   │   ├── AuthPosterPanel.vue   # Panel lateral ilustrado para login/registro
│   │   ├── EventCard.vue         # Tarjeta de actividad con diseño de ticket
│   │   ├── OfflineBanner.vue     # Banner de alerta sin conexión
│   │   └── TicketCard.vue        # Contenedor con estética de ticket perforado
│   ├── composables/
│   │   ├── useApi.ts             # Cliente HTTP envoltorio de $fetch con Bearer token
│   │   ├── useCategoryStyle.ts   # Paletas visuales por categoría
│   │   └── useOnlineStatus.ts    # Detección del estado de conexión del navegador
│   ├── middleware/
│   │   ├── admin.ts              # Protección para administradores
│   │   ├── auth.ts               # Protección para usuarios autenticados
│   │   └── organizer.ts          # Protección para organizadores y admin
│   ├── pages/
│   │   ├── index.vue             # Página de inicio / Hero
│   │   ├── login.vue             # Inicio de sesión
│   │   ├── registro.vue          # Registro de nuevos usuarios
│   │   ├── actividades.vue       # Catálogo con filtros y búsqueda
│   │   ├── actividad/[id].vue    # Detalle, inscripción y favoritos
│   │   ├── dashboard.vue         # Dashboard adaptable por rol
│   │   ├── favoritos.vue         # Lista de actividades guardadas
│   │   ├── mis-actividades.vue   # CRUD y participantes para organizadores
│   │   ├── mis-inscripciones.vue # Historial y cancelación de inscripciones
│   │   ├── notificaciones.vue    # Centro de notificaciones y recordatorios
│   │   ├── perfil.vue            # Edición de perfil de usuario
│   │   └── admin/
│   │       ├── index.vue         # Panel general de admin
│   │       ├── categories.vue    # Gestión de categorías
│   │       ├── events.vue        # Moderación de actividades
│   │       ├── statistics.vue    # Estadísticas globales
│   │       └── users.vue         # Gestión de roles de usuario
│   └── stores/
│       ├── auth.ts               # Store de autenticación y sesión
│       ├── events.ts             # Store de actividades, filtros y categorías
│       └── notifications.ts      # Store de notificaciones
├── public/
│   ├── favicon.ico
│   └── icons/                    # Iconos PWA (192, 512, maskable)
├── nuxt.config.ts                # Configuración de módulos, head, PWA y runtimeConfig
├── package.json
├── tsconfig.json
├── .env.example
├── LICENSE
└── README.md
```

---

## 🚀 Instalación y Ejecución Local

### Prerrequisitos
* Node.js v18 o superior.
* Backend de CommunityHub ejecutándose (por defecto en `http://localhost:4000/api`).

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/ferSibaja/communityhub-frontend.git
   cd communityhub-frontend
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   *(Asegúrate de que `NUXT_PUBLIC_API_BASE` apunte a la URL de tu backend Express)*.

4. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```
   La aplicación estará disponible en `http://localhost:3000`.

---

## 📱 Probar la Progressive Web App (PWA)

1. **Construir y previsualizar en producción:**
   ```bash
   npm run build
   npm run preview
   ```
2. **Instalar la aplicación:**
   * Abre `http://localhost:3000` en Chrome o Edge.
   * Haz clic en el ícono de instalación en la barra de direcciones o en el menú de opciones $\rightarrow$ *"Instalar CommunityHub"*.
3. **Comprobar funcionamiento Offline:**
   * Abre las herramientas de desarrollo (**F12**) $\rightarrow$ Pestaña **Network** (Red).
   * Cambia la conexión de *No throttling* a **Offline**.
   * Observa el banner superior *"Estás sin conexión — mostrando información guardada previamente"* y navega por las actividades previamente consultadas sin perder acceso.

---

## 🎬 Flujo de Demostración Final

Para la presentación del proyecto, se recomienda seguir este flujo completo:

1. **Registro:** Crear un nuevo usuario en `/registro`.
2. **Inicio de sesión:** Ingresar con la cuenta creada en `/login`.
3. **Exploración:** Buscar y filtrar actividades en `/actividades`.
4. **Inscripción y Favoritos:** Entrar al detalle de una actividad (`/actividad/:id`), marcarla como favorita e inscribirse.
5. **Dashboard:** Verificar la actualización inmediata de métricas en `/dashboard`.
6. **Organizador:** Iniciar sesión como organizador, crear un evento en `/mis-actividades` y consultar el modal de participantes inscritos.
7. **Notificaciones:** Revisar el centro de notificaciones en `/notificaciones` y el badge del header.
8. **Prueba PWA Offline:** Desconectar la red en DevTools y demostrar la consulta de eventos en caché y el banner de estado offline.

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE) para más información.
