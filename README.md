# CommunityHub

Plataforma comunitaria de actividades y eventos. Permite a los usuarios registrarse, crear y administrar actividades, inscribirse en eventos, marcar favoritos, recibir notificaciones y consultar estadísticas mediante un dashboard según su rol.

Proyecto desarrollado para el curso de Software Libre — Universidad Técnica Nacional (UTN), Sede Regional de San Carlos.

## Stack tecnológico

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT (autenticación) + bcrypt/bcryptjs
- Variables de entorno con `.env`

**Frontend**
- Nuxt 4 / Vue 3
- TypeScript
- Pinia

**Cloud / Serverless**
- AWS Lambda
- API Gateway / EventBridge / S3 / SES (según funcionalidad)

**PWA**
- Web App Manifest + Service Worker (funcionalidad offline)

## Estructura del repositorio

```
communityhub/
├── backend/     # API REST con Express.js
├── frontend/    # Aplicación Nuxt 4 / Vue 3
├── lambda/      # Función AWS Lambda (serverless)
├── docs/        # Documentación adicional del proyecto
├── .env.example
├── .gitignore
├── LICENSE
└── README.md
```

## Roles de usuario

- **Administrador**: gestiona usuarios, actividades, categorías y estadísticas globales.
- **Organizador**: crea y administra sus propias actividades.
- **Usuario**: consulta actividades, se inscribe y gestiona sus favoritos.

## Autoras

- María Jimena Jara Rojas
- Fernanda Sibaja Campos

## Estado del proyecto

🚧 En desarrollo — Proyecto Final del curso.

## Instalación

_Se documentará a medida que backend, frontend y lambda tengan una versión ejecutable inicial._

## Licencia

Este proyecto se distribuye bajo la licencia [MIT](LICENSE).