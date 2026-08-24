# CommunityHub — Backend

API REST del proyecto **CommunityHub**, una plataforma comunitaria de actividades y eventos.  
Desarrollada con **Node.js**, **Express.js** y **MongoDB**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-24.x-green.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com)

---

## Descripción

Backend de la plataforma CommunityHub que expone una API REST para:

- Registro e inicio de sesión con JWT
- Gestión de actividades (CRUD) con validaciones
- Inscripción y cancelación a eventos
- Marcado de favoritos
- Dashboard diferenciado por rol (usuario, organizador, administrador)
- Notificaciones internas
- Gestión de categorías
- Búsqueda y filtrado de actividades

---

## Tecnologías

| Tecnología | Uso |
|------------|-----|
| Node.js | Runtime |
| Express.js | Framework HTTP |
| MongoDB + Mongoose | Base de datos |
| JWT | Autenticación |
| bcryptjs | Hash de contraseñas |
| dotenv | Variables de entorno |
| nodemon | Desarrollo |
| cors | Política CORS |

---

## Requisitos previos

- Node.js v18 o superior
- MongoDB Atlas (o instancia local de MongoDB)
- npm

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/<tu-usuario>/communityhub-backend.git
cd communityhub-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales

# 4. (Opcional) Poblar la base de datos con datos iniciales
node src/utils/seed.js

# 5. Iniciar el servidor de desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:4000`.

---

## Estructura del proyecto

```
src/
├── config/          # Configuración de base de datos
├── controllers/     # Lógica de cada endpoint
├── middleware/      # Autenticación, autorización y errores
├── models/          # Esquemas Mongoose
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── utils/           # Utilidades (ApiError, JWT, seed)
├── app.js           # Configuración de Express
└── server.js        # Punto de entrada
```

---

## Variables de entorno

Copiar `.env.example` como `.env` y completar los valores:

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (default: `4000`) |
| `NODE_ENV` | Entorno (`development` / `production`) |
| `MONGODB_URI` | URI de conexión a MongoDB |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |
| `JWT_EXPIRES_IN` | Tiempo de expiración del JWT (ej: `7d`) |
| `FRONTEND_URL` | Origen(es) permitidos por CORS |
| `AWS_REGION` | Región de AWS |
| `AWS_ACCESS_KEY_ID` | Clave de acceso AWS |
| `AWS_SECRET_ACCESS_KEY` | Clave secreta AWS |
| `LAMBDA_FUNCTION_NAME` | Nombre de la función Lambda |

---

## API Reference

### Autenticación

```
POST   /api/auth/register     Registrar usuario
POST   /api/auth/login        Iniciar sesión
GET    /api/auth/me           Usuario actual (auth)
POST   /api/auth/logout       Cerrar sesión (auth)
```

### Usuarios

```
GET    /api/users                     Listar usuarios (auth admin)
GET    /api/users/:id                 Ver perfil (auth)
PUT    /api/users/:id                 Editar perfil (auth)
DELETE /api/users/:id                 Eliminar usuario (auth admin)
GET    /api/users/me/registrations    Mis inscripciones (auth)
GET    /api/users/me/favorites        Mis favoritos (auth)
POST   /api/users/me/avatar           Subir foto de perfil (multipart/form-data: avatar) (auth)
```

### Actividades

```
GET    /api/events               Listar actividades (público, con filtros)
GET    /api/events/:id           Ver detalle (público)
GET    /api/events/:id/participants Ver lista de participantes (auth owner/admin)
POST   /api/events               Crear actividad (auth organizador/admin)
PUT    /api/events/:id           Editar actividad (auth owner/admin)
DELETE /api/events/:id           Eliminar actividad (auth owner/admin)
POST   /api/events/:id/register  Inscribirse (auth)
DELETE /api/events/:id/register  Cancelar inscripción (auth)
GET    /api/events/:id/register/status  Estado de inscripción (auth)
POST   /api/events/:id/favorite  Agregar favorito (auth)
DELETE /api/events/:id/favorite  Quitar favorito (auth)
GET    /api/events/:id/favorite/status  Estado de favorito (auth)
```

**Filtros disponibles en `GET /api/events`:**

```
?search=javascript    Buscar por título
?category=<id>        Filtrar por categoría
?date=2026-09-01      Filtrar por fecha
?location=San José    Filtrar por ubicación
?available=true       Solo eventos con cupos disponibles
?organizer=<id>       Filtrar por organizador
?status=active        Estado del evento
?page=1&limit=12      Paginación
```

### Categorías

```
GET    /api/categories        Listar (público)
GET    /api/categories/:id    Ver detalle (público)
POST   /api/categories        Crear (auth admin)
PUT    /api/categories/:id    Editar (auth admin)
DELETE /api/categories/:id    Eliminar (auth admin)
```

### Notificaciones

```
GET    /api/notifications          Mis notificaciones (auth)
PATCH  /api/notifications/:id/read Marcar como leída (auth)
PATCH  /api/notifications/read-all Marcar todas como leídas (auth)
```

### Dashboard

```
GET    /api/dashboard    Dashboard según rol del usuario (auth)
```

### Health Check

```
GET    /api/health    Verificar que la API esté activa (público)
```

---

## Autenticación

Los endpoints marcados con auth requieren el header:

```
Authorization: Bearer <token>
```

El token se obtiene al hacer login en `POST /api/auth/login`.

---

## Roles

| Rol | Permisos |
|-----|----------|
| `usuario` | Consultar actividades, inscribirse, marcar favoritos, ver historial |
| `organizador` | CRUD de sus propias actividades, ver participantes |
| `administrador` | Acceso total: usuarios, actividades y categorías |

---

## Datos de prueba (Seed)

```bash
node src/utils/seed.js
```

Crea los siguientes usuarios con contraseña `password123`:

| Email | Rol |
|-------|-----|
| `admin@communityhub.com` | Administrador |
| `organizer@communityhub.com` | Organizador |
| `user@communityhub.com` | Usuario |

También crea 5 categorías y 3 actividades de prueba.

---

## Manejo de errores

Todas las respuestas de error siguen el formato:

```json
{
  "success": false,
  "message": "Descripción del error"
}
```

| Código | Significado |
|--------|-------------|
| 400 | Solicitud inválida / campos faltantes |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej: ya inscrito, sin cupos) |
| 500 | Error interno del servidor |

---

## Licencia

Este proyecto está licenciado bajo la [Licencia MIT](./LICENSE).