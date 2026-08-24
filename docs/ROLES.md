# Roles y permisos

CommunityHub maneja tres roles, almacenados en `User.role`: `administrador`, `organizador`, `usuario`.

| Acción | Usuario | Organizador | Administrador |
|---|:---:|:---:|:---:|
| Consultar actividades | ✅ | ✅ | ✅ |
| Inscribirse / cancelar inscripción | ✅ | ✅ | ✅ |
| Marcar favoritos | ✅ | ✅ | ✅ |
| Consultar su historial / notificaciones | ✅ | ✅ | ✅ |
| Crear actividad | ❌ | ✅ | ✅ |
| Editar/cancelar **su propia** actividad | ❌ | ✅ | ✅ |
| Editar/cancelar actividad de **otro** organizador | ❌ | ❌ | ✅ |
| Consultar participantes de una actividad | ❌ | ✅ (solo las suyas, vía middleware) | ✅ |
| Gestionar categorías (crear/editar/eliminar) | ❌ | ❌ | ✅ |
| Gestionar usuarios (listar/editar/eliminar) | ❌ | ❌ | ✅ |
| Ver estadísticas globales | ❌ | ❌ | ✅ |

## Implementación

- Middleware `authenticate` (`backend/src/middleware/auth.middleware.js`): valida el JWT y adjunta `req.user`.
- Middleware `authorize(...roles)`: restringe una ruta a los roles indicados (ver [`event.routes.js`](../backend/src/routes/event.routes.js), [`category.routes.js`](../backend/src/routes/category.routes.js)).
- Propiedad de recursos: en el servicio de eventos se valida que `event.organizer === req.user.id` antes de permitir `PUT`/`DELETE`, salvo que el usuario sea `administrador`.
- En el frontend, los middlewares de ruta `admin.ts` y `organizer.ts` (`frontend/app/middleware/`) ocultan/bloquean el acceso a páginas según el rol guardado en el store `auth`.
