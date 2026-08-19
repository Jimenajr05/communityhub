# Módulo AWS Lambda - Procesador Serverless de Notificaciones

Este módulo contiene la función serverless de **AWS Lambda** requerida para la plataforma **CommunityHub**.

## Justificación Arquitectónica

En lugar de recargar el servidor Express con tareas cron en segundo plano que bloqueen el hilo de ejecución principal, la arquitectura delega el procesamiento periódico de eventos y la generación de recordatorios a **AWS Lambda** disparada mediante **AWS EventBridge**.

### Flujo de Arquitectura

```
  AWS EventBridge (Cron: Cada 6 horas)
             │
             ▼
        AWS Lambda
             │
   (Conexión MONGODB_URI)
             ▼
   Base de Datos MongoDB
             │ (Consulta eventos < 24h & crea notificaciones)
             ▼
  Notificaciones generadas para usuarios inscritos
```

## Configuración y Despliegue

1. **Runtime**: Node.js 18.x o superior.
2. **Handler**: `index.handler`.
3. **Variables de Entorno en AWS Lambda**:
   - `MONGODB_URI`: String de conexión a MongoDB Atlas (ej. `mongodb+srv://user:pass@cluster.mongodb.net/communityhub`).
4. **Trigger**: Regla de AWS EventBridge (CloudWatch Events) con expresión cron `cron(0 */6 * * ? *)` para ejecución cada 6 horas.