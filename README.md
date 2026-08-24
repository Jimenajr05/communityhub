# CommunityHub

Plataforma comunitaria de actividades y eventos: registro/login, creación y gestión de actividades, inscripciones, favoritos, notificaciones, dashboards por rol y reportes automáticos.

Proyecto final del curso **Aplicaciones Web Utilizando Software Libre**. El código vive en un único repositorio (monorepo), con el historial completo de cada módulo importado desde sus repos originales:

| Carpeta | Descripción | Stack |
|---|---|---|
| [`backend/`](./backend) | API REST | Node.js, Express, MongoDB/Mongoose, JWT |
| [`frontend/`](./frontend) | Aplicación web (PWA) | Nuxt 4, Vue 3, TypeScript, Pinia |
| [`lambda/`](./lambda) | Procesamiento serverless | AWS Lambda + EventBridge |

La carpeta [`docs/`](./docs) documenta la arquitectura, la API, los roles y las funciones Lambda a nivel de todo el proyecto.

## Arquitectura

```
   Nuxt 4 / Vue 3 (PWA)  ──HTTP/JSON──▶  Express API  ──Mongoose──▶  MongoDB
                                              ▲
                                              │ (misma MONGODB_URI)
                                     AWS Lambda + EventBridge
                              (recordatorios cada 6h · reporte diario)
```

El frontend **nunca** accede a MongoDB directamente: todo pasa por la API de Express. Ver [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) para el detalle.

## Puesta en marcha local

### 1. Backend

```bash
cd backend
cp .env.example .env   # completar MONGODB_URI, JWT_SECRET, etc.
npm install
npm run seed            # carga usuarios/categorías/actividades de prueba
npm run dev              # http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:3000
```

### 3. Lambda (opcional, requiere cuenta AWS)

```bash
cd lambda
npm install
npm run check-aws     # valida credenciales
npm run pack           # empaqueta y sube el código
npm run deploy          # despliega communityhub-notifications + cron 6h
npm run deploy:report  # despliega communityhub-report + cron diario
```

Ver [`lambda/README.md`](./lambda/README.md) y [`docs/LAMBDA.md`](./docs/LAMBDA.md).

## Usuarios de prueba (tras `npm run seed`)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@communityhub.com | password123 |

Ver el script [`backend/src/utils/seed.js`](./backend/src/utils/seed.js) para el resto de usuarios/datos sembrados.

## Documentación

- [`docs/API.md`](./docs/API.md) — endpoints de la API REST.
- [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — arquitectura general.
- [`docs/ROLES.md`](./docs/ROLES.md) — permisos por rol.
- [`docs/LAMBDA.md`](./docs/LAMBDA.md) — funciones serverless (recordatorios y reporte de estadísticas).

## Licencia

MIT — ver `LICENSE` (raíz).
