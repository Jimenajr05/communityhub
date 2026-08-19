const mongoose = require('mongoose');

// Schemas simplificados para ejecución serverless sin depender de modelos externos completos
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    type: { type: String, enum: ['reminder', 'update', 'cancellation', 'system'], default: 'reminder' },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const registrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  status: { type: String },
});

const eventSchema = new mongoose.Schema({
  title: { type: String },
  date: { type: Date },
  status: { type: String },
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

exports.handler = async (event, context) => {
  // En entornos Serverless reutilizamos la conexión existente si está activa
  context.callbackWaitsForEmptyEventLoop = false;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Falta la variable MONGODB_URI en la configuración de Lambda' }),
    };
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    }

    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // 1. Buscar eventos activos que ocurrirán dentro de las próximas 24h
    const upcomingEvents = await Event.find({
      status: 'active',
      date: { $gte: now, $lte: next24Hours },
    });

    let notificationsCreated = 0;

    for (const upcomingEvent of upcomingEvents) {
      // 2. Obtener usuarios inscritos
      const registrations = await Registration.find({
        event: upcomingEvent._id,
        status: 'confirmed',
      });

      for (const reg of registrations) {
        // 3. Verificar si ya se envió un recordatorio previo para este evento
        const existingNotif = await Notification.findOne({
          user: reg.user,
          event: upcomingEvent._id,
          type: 'reminder',
        });

        if (!existingNotif) {
          await Notification.create({
            user: reg.user,
            event: upcomingEvent._id,
            type: 'reminder',
            message: `⏰ Recordatorio: La actividad "${upcomingEvent.title}" se llevará a cabo en menos de 24 horas.`,
          });
          notificationsCreated++;
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Procesamiento serverless de recordatorios completado',
        upcomingEventsProcessed: upcomingEvents.length,
        notificationsCreated,
      }),
    };
  } catch (error) {
    console.error('Error en ejecución de AWS Lambda:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};