# Roles y permisos

CommunityHub maneja tres roles, almacenados en `User.role`: `administrador`, `organizador`, `usuario`.

| Acción | Usuario | Organizador | Administrador |
|---|:---:|:---:|:---:|
| Consultar actividades | Si | Si | Si |
| Inscribirse / cancelar inscripción | Si | Si | Si |
| Marcar favoritos | Si | Si | Si |
| Consultar su historial / notificaciones | Si | Si | Si |
| Crear actividad | No | Si | Si |
| Editar/cancelar **su propia** actividad | No | Si | Si |
| Editar/cancelar actividad de **otro** organizador | No | No | Si |
| Consultar participantes de una actividad | No | Si (solo las suyas, vía middleware) | Si |
| Gestionar categorías (crear/editar/eliminar) | No | No | Si |
| Gestionar usuarios (listar/editar/eliminar) | No | No | Si |
| Ver estadísticas globales | No | No | Si |

## Implementación

- Middleware `authenticate` (`backend/src/middleware/auth.middleware.js`): valida el JWT y adjunta `req.user`.
- Middleware `authorize(...roles)`: restringe una ruta a los roles indicados (ver [`event.routes.js`](../backend/src/routes/event.routes.js), [`category.routes.js`](../backend/src/routes/category.routes.js)).
- Propiedad de recursos: en el servicio de eventos se valida que `event.organizer === req.user.id` antes de permitir `PUT`/`DELETE`, salvo que el usuario sea `administrador`.
- En el frontend, los middlewares de ruta `admin.ts` y `organizer.ts` (`frontend/app/middleware/`) ocultan/bloquean el acceso a páginas según el rol guardado en el store `auth`.
