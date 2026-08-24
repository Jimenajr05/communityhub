# AWS Lambda — Procesamiento serverless

## Justificación

En lugar de usar Lambda para una operación CRUD tradicional (que ya cubre el backend Express), se utiliza para una tarea **asíncrona y programada** que no debe depender de que un usuario tenga la app abierta: generar **recordatorios de actividades próximas**.

## Flujo

```
AWS EventBridge (regla cada 6 horas)
        │
        ▼
   AWS Lambda (lambda/index.js)
        │  conecta directamente a MongoDB (misma MONGODB_URI del backend)
        ▼
   1. Busca eventos con status "active" cuya fecha cae en las próximas 24h
   2. Por cada evento, obtiene las inscripciones con status "confirmed"
   3. Por cada inscripción, si no existe ya un recordatorio (type: "reminder")
      para ese usuario/evento, crea uno en la colección "notifications"
        │
        ▼
   Usuario ve el recordatorio en GET /api/notifications (frontend)
```

## Código

Archivo principal: [`lambda/index.js`](../lambda/index.js).

- Reutiliza la conexión de Mongoose entre invocaciones (`context.callbackWaitsForEmptyEventLoop = false` y verificación de `mongoose.connection.readyState`).
- Define esquemas simplificados (no depende del código del backend) para poder desplegarse como paquete independiente.
- Es **idempotente**: no duplica recordatorios si se ejecuta varias veces sobre el mismo evento/usuario.

## Despliegue

Scripts incluidos en el carpeta `lambda`:

| Script | Función |
|---|---|
| `pack_and_upload.js` | Empaqueta el código y lo sube a AWS Lambda |
| `deploy.js` | Crea/actualiza la función Lambda y configura el trigger de EventBridge |
| `setup_eventbridge.js` | Crea la regla de EventBridge (cada 6 horas) y el permiso de invocación |
| `check_aws.js` | Verifica credenciales/configuración de AWS antes de desplegar |

Variables de entorno requeridas por la función (configuradas en la consola de Lambda, no en el repo):

```
MONGODB_URI=...
AWS_REGION=...
```

## Segunda función: reporte periódico de estadísticas

Además de los recordatorios, el módulo implementa el segundo caso de uso sugerido por el enunciado (sección 17): un **reporte periódico de estadísticas generales** de la plataforma, disparado por su propia regla de AWS EventBridge.

### Flujo

```
AWS EventBridge (regla diaria: rate(1 day))
        │
        ▼
   AWS Lambda (lambda/index.js → exports.reportHandler)
        │  conecta a MongoDB (misma MONGODB_URI del backend)
        ▼
   1. Cuenta usuarios, organizadores, actividades (activas/finalizadas)
      e inscripciones confirmadas
   2. Calcula la actividad más popular (más inscripciones) vía agregación
   3. Calcula la categoría más utilizada (más actividades) vía agregación
   4. Crea una notificación (type: "report") para cada usuario administrador
        │
        ▼
   El admin ve el resumen en GET /api/notifications (frontend → /notificaciones)
```

### Código

Mismo archivo que la función de recordatorios: [`lambda/index.js`](../lambda/index.js), exportado como `reportHandler` (handler de Lambda: `index.reportHandler`), para reutilizar el paquete de despliegue y el patrón de conexión a Mongo sin duplicar código.

### Despliegue

Se despliega como una **función Lambda independiente** (`communityhub-report`), con su propia regla de EventBridge (`communityhub-report-cron`, cada 24h) para no acoplar su frecuencia a la de los recordatorios (cada 6h):

```
npm run deploy        # despliega communityhub-notifications (reminders) + su cron de 6h
npm run deploy:report # despliega communityhub-report (reportHandler) + su cron diario
```

`deploy_report.js` reutiliza el rol IAM ya creado por `deploy.js` (`communityhub-lambda-role`), así que primero debe ejecutarse `npm run deploy` al menos una vez.
