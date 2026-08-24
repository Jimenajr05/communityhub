# CommunityHub — Documentación

Documentación técnica del proyecto **CommunityHub**, plataforma comunitaria de actividades y eventos, desarrollada como proyecto final del curso de Aplicaciones Web Utilizando Software Libre.

El proyecto está dividido en **tres repositorios independientes** (autorizado por el docente):

| Repositorio | Descripción | Tecnología |
|---|---|---|
| [`backend`](../backend) | API REST | Node.js + Express.js + MongoDB |
| [`frontend`](../frontend) | Cliente web / PWA | Nuxt 4 + Vue 3 + Pinia |
| [`lambda`](../lambda) | Procesamiento serverless | AWS Lambda + EventBridge |

Esta carpeta `docs/` centraliza la documentación que cruza los tres repositorios (arquitectura, contrato de la API y flujo del Lambda), de forma que no quede duplicada ni dispersa entre ellos.

## Contenido

- [ARCHITECTURE.md](./ARCHITECTURE.md) — arquitectura general, diagrama de componentes y flujo de datos.
- [API.md](./API.md) — referencia completa de los endpoints de la API REST.
- [LAMBDA.md](./LAMBDA.md) — funcionamiento de la función AWS Lambda y su disparador en EventBridge.
- [ROLES.md](./ROLES.md) — matriz de roles y permisos.

## Enlaces rápidos

- README del backend: [`backend/README.md`](../backend/README.md)
- README del frontend: [`frontend/README.md`](../frontend/README.md)
- README del lambda: [`lambda/README.md`](../lambda/README.md)
