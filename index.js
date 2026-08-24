const mongoose = require('mongoose');

// Schemas simplificados para ejecución serverless sin depender de modelos externos completos
const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: false },
    type: {
      type: String,
      enum: ['reminder', 'update', 'cancellation', 'system', 'report'],
      default: 'reminder',
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const registrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
    status: { type: String },
  },
  { timestamps: true }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    date: { type: Date },
    status: { type: String },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    role: { type: String },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema({
  name: { type: String },
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
const Registration = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

async function ensureConnection() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('Falta la variable MONGODB_URI en la configuración de Lambda');
  }
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  }
}

exports.handler = async (event, context) => {
  // En entornos Serverless reutilizamos la conexión existente si está activa
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await ensureConnection();

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

/**
 * Segunda función serverless: genera un reporte periódico de estadísticas
 * generales de la plataforma (punto 17 del enunciado) y lo entrega como
 * notificación de tipo "report" a cada administrador, para que lo consulte
 * desde GET /api/notifications sin exponer un endpoint nuevo en el backend.
 *
 * Disparada por una regla de AWS EventBridge independiente (p. ej. una vez
 * al día), separada de la de recordatorios para no acoplar ambas tareas.
 */
exports.reportHandler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    await ensureConnection();

    const [
      totalUsers,
      totalOrganizers,
      totalEvents,
      activeEvents,
      finishedEvents,
      totalRegistrations,
      admins,
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'organizador' }),
      Event.countDocuments({}),
      Event.countDocuments({ status: 'active' }),
      Event.countDocuments({ status: 'finished' }),
      Registration.countDocuments({ status: 'confirmed' }),
      User.find({ role: 'administrador' }, '_id'),
    ]);

    // Actividad más popular: la que tiene más inscripciones confirmadas
    const popularAgg = await Registration.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: '$event', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 1 },
    ]);
    let mostPopularEvent = null;
    if (popularAgg.length > 0) {
      const ev = await Event.findById(popularAgg[0]._id, 'title');
      mostPopularEvent = ev ? { title: ev.title, registrations: popularAgg[0].total } : null;
    }

    // Categoría más utilizada: la que tiene más actividades creadas
    const categoryAgg = await Event.aggregate([
      { $group: { _id: '$category', total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 1 },
    ]);
    let topCategory = null;
    if (categoryAgg.length > 0 && categoryAgg[0]._id) {
      const cat = await Category.findById(categoryAgg[0]._id, 'name');
      topCategory = cat ? { name: cat.name, events: categoryAgg[0].total } : null;
    }

    const stats = {
      totalUsers,
      totalOrganizers,
      totalEvents,
      activeEvents,
      finishedEvents,
      totalRegistrations,
      mostPopularEvent,
      topCategory,
      generatedAt: new Date().toISOString(),
    };

    const summary =
      `📊 Reporte CommunityHub — ${totalUsers} usuarios (${totalOrganizers} organizadores), ` +
      `${totalEvents} actividades (${activeEvents} activas, ${finishedEvents} finalizadas), ` +
      `${totalRegistrations} inscripciones confirmadas.` +
      (mostPopularEvent ? ` Actividad más popular: "${mostPopularEvent.title}".` : '') +
      (topCategory ? ` Categoría más usada: "${topCategory.name}".` : '');

    await Promise.all(
      admins.map((admin) =>
        Notification.create({
          user: admin._id,
          type: 'report',
          message: summary,
        })
      )
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Reporte periódico generado correctamente',
        adminsNotified: admins.length,
        stats,
      }),
    };
  } catch (error) {
    console.error('Error generando el reporte periódico de AWS Lambda:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
      }),
    };
  }
};