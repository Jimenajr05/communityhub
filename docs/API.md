# API REST — Referencia

Base URL por defecto: `http://localhost:4000/api` (configurable con `NUXT_PUBLIC_API_BASE` en el frontend y `PORT` en el backend).

Autenticación: **JWT Bearer**. Enviar `Authorization: Bearer <token>` en las rutas protegidas (obtenido en `/auth/login` o `/auth/register`).

Formato de error estándar:
```json
{ "success": false, "message": "Descripción del error" }
```
Códigos usados: `400` (validación), `401` (no autenticado), `403` (sin permisos), `404` (no encontrado), `409` (conflicto, p. ej. correo o inscripción duplicada), `500` (error interno).

---

## Auth (`/api/auth`)

| Método | Ruta | Protegida | Descripción |
|---|---|---|---|
| POST | `/register` | No | Registro de usuario (nombre, apellido, correo, contraseña, foto opcional) |
| POST | `/login` | No | Inicio de sesión, retorna JWT |
| GET | `/me` | Sí | Datos del usuario autenticado |
| POST | `/logout` | Sí | Cierre de sesión |

## Events (`/api/events`)

| Método | Ruta | Protegida | Rol requerido | Descripción |
|---|---|---|---|---|
| GET | `/` | No | — | Listado con filtros por query params: `category`, `date`, `location`, `available`, `organizer`, `search` |
| GET | `/:id` | No | — | Detalle de una actividad |
| POST | `/` | Sí | organizador, administrador | Crear actividad |
| PUT | `/:id` | Sí | organizador (propietario), administrador | Actualizar actividad |
| DELETE | `/:id` | Sí | organizador (propietario), administrador | Eliminar actividad |
| POST | `/:id/register` | Sí | cualquier usuario autenticado | Inscribirse a la actividad |
| DELETE | `/:id/register` | Sí | cualquier usuario autenticado | Cancelar inscripción |
| GET | `/:id/register/status` | Sí | cualquier usuario autenticado | Consultar si el usuario está inscrito |
| POST | `/:id/favorite` | Sí | cualquier usuario autenticado | Marcar como favorito |
| DELETE | `/:id/favorite` | Sí | cualquier usuario autenticado | Quitar de favoritos |
| GET | `/:id/favorite/status` | Sí | cualquier usuario autenticado | Consultar si es favorito |
| GET | `/:id/participants` | Sí | organizador, administrador | Listado de inscritos |

Validaciones aplicadas en el modelo/servicio: no se permiten fechas pasadas, capacidad ≤ 0, título/descripción/ubicación vacíos, ni que un organizador edite/elimine actividades de otro organizador (solo el propietario o un administrador pueden hacerlo).

## Categories (`/api/categories`)

| Método | Ruta | Protegida | Rol requerido | Descripción |
|---|---|---|---|---|
| GET | `/` | No | — | Listado de categorías |
| GET | `/:id` | No | — | Detalle de una categoría |
| POST | `/` | Sí | administrador | Crear categoría |
| PUT | `/:id` | Sí | administrador | Actualizar categoría |
| DELETE | `/:id` | Sí | administrador | Eliminar categoría |

## Users (`/api/users`)

| Método | Ruta | Protegida | Rol requerido | Descripción |
|---|---|---|---|---|
| GET | `/me/registrations` | Sí | cualquiera | Inscripciones del usuario autenticado |
| GET | `/me/favorites` | Sí | cualquiera | Favoritos del usuario autenticado |
| POST | `/me/avatar` | Sí | cualquiera | Subir foto de perfil |
| GET | `/` | Sí | administrador | Listado de usuarios |
| GET | `/:id` | Sí | propio perfil o administrador | Detalle de usuario |
| PUT | `/:id` | Sí | propio perfil o administrador | Actualizar usuario |
| DELETE | `/:id` | Sí | administrador | Eliminar usuario |

## Dashboard (`/api/dashboard`)

| Método | Ruta | Protegida | Descripción |
|---|---|---|---|
| GET | `/` | Sí | Datos del dashboard, con contenido distinto según el rol del usuario autenticado (usuario / organizador / administrador) |

## Notifications (`/api/notifications`)

| Método | Ruta | Protegida | Descripción |
|---|---|---|---|
| GET | `/` | Sí | Listado de notificaciones del usuario |
| PATCH/PUT/POST | `/read-all` | Sí | Marcar todas como leídas |
| PATCH/PUT/POST | `/:id/read` | Sí | Marcar una notificación como leída |

---

## Modelos de datos (colecciones MongoDB)

- **users**: `firstName`, `lastName`, `email` (único), `password` (hash, nunca se expone), `profilePicture`, `role` (`administrador` \| `organizador` \| `usuario`).
- **events**: `title`, `description`, `category` (ref Category), `date`, `time`, `location`, `capacity`, `image`, `organizer` (ref User), `status` (`active` \| `cancelled` \| `finished`).
- **categories**: `name` (único), `description`.
- **registrations**: `user` (ref), `event` (ref), `status` (`confirmed` \| `cancelled`) — índice único `(user, event)`.
- **favorites**: `user` (ref), `event` (ref) — índice único `(user, event)`.
- **notifications**: `user` (ref), `event` (ref, opcional), `type` (`reminder` \| `update` \| `cancellation` \| `registration` \| `system`), `message`, `read`.
