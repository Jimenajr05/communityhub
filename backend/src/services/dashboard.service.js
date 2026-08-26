const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');
const Category = require('../models/Category');

/**
 * Evaluará en tiempo real si una actividad ya ha concluido comparando la fecha y hora
 * del evento contra el reloj actual, sin alterar la base de datos ni forzar cambios.
 * @param {Object} event Documento de la actividad.
 * @param {Date} [now] Fecha/hora actual.
 * @returns {boolean} true si la actividad ya ha finalizado.
 */
function isEventFinishedInRealTime(event, now = new Date()) {
  if (!event || !event.date) return false;
  if (event.status === 'cancelled') return false;
  if (event.status === 'finished') return true;

  const baseDate = new Date(event.date);
  if (isNaN(baseDate.getTime())) return false;

  const year = baseDate.getUTCFullYear();
  const month = baseDate.getUTCMonth();
  const day = baseDate.getUTCDate();

  const end = new Date(year, month, day);

  if (event.time) {
    const match = String(event.time).toLowerCase().trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
    if (match) {
      let horas = parseInt(match[1], 10);
      const minutos = parseInt(match[2], 10);
      const meridiano = match[3];

      if (meridiano === 'pm' && horas < 12) horas += 12;
      if (meridiano === 'am' && horas === 12) horas = 0;

      // Estimamos la conclusión del evento 2 horas después de la hora de inicio
      end.setHours(horas + 2, minutos, 0, 0);
      return now > end;
    }
  }

  // Si no hay hora específica, el evento concluye al terminar el día (23:59:59)
  end.setHours(23, 59, 59, 999);
  return now > end;
}

/**
 * Genera los datos del panel (dashboard) para un usuario regular.
 */
async function getUserDashboard(userId) {
  const [registrations, favoritesCount, unreadNotificationsCount] = await Promise.all([
    Registration.find({ user: userId, status: 'confirmed' })
      .populate({
        path: 'event',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'organizer', select: 'firstName lastName profilePicture' },
        ],
      })
      .sort({ createdAt: -1 }),
    Favorite.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, read: false }),
  ]);

  const now = new Date();

  const upcomingRegistrations = registrations.filter(
    (r) => r.event && !isEventFinishedInRealTime(r.event, now)
  );

  const historyRegistrations = registrations.filter(
    (r) => r.event && isEventFinishedInRealTime(r.event, now)
  );

  return {
    registrationsCount: registrations.length,
    upcomingCount: upcomingRegistrations.length,
    historyCount: historyRegistrations.length,
    favoritesCount,
    unreadNotificationsCount,
    upcomingEvents: upcomingRegistrations.slice(0, 5).map((r) => r.event),
    historyEvents: historyRegistrations.slice(0, 5).map((r) => r.event),
  };
}

/**
 * Genera los datos del panel (dashboard) para un organizador.
 */
async function getOrganizerDashboard(organizerId) {
  const events = await Event.find({ organizer: organizerId }).sort({ date: 1 });
  const eventIds = events.map((e) => e._id);

  const registrations = await Registration.find({
    event: { $in: eventIds },
    status: 'confirmed',
  });

  const regCountMap = {};
  for (const r of registrations) {
    const evIdStr = r.event.toString();
    regCountMap[evIdStr] = (regCountMap[evIdStr] || 0) + 1;
  }

  const now = new Date();

  const upcomingEvents = events.filter((e) => !isEventFinishedInRealTime(e, now));

  let totalCapacity = 0;
  let availableCapacity = 0;
  let cancelledCount = 0;
  let activeCount = 0;

  for (const e of events) {
    if (e.status === 'cancelled') {
      cancelledCount++;
      continue;
    }

    const regCount = regCountMap[e._id.toString()] || 0;
    const cap = e.capacity || 0;
    totalCapacity += cap;

    if (!isEventFinishedInRealTime(e, now)) {
      activeCount++;
      const spotsAvailable = Math.max(0, cap - regCount);
      availableCapacity += spotsAvailable;
    }
  }

  return {
    totalEvents: events.length,
    activeEventsCount: activeCount,
    cancelledEventsCount: cancelledCount,
    upcomingEventsCount: upcomingEvents.length,
    totalParticipants: registrations.length,
    totalCapacity,
    availableCapacity,
    upcomingEvents: upcomingEvents.slice(0, 5),
    recentEvents: events.slice(0, 5),
  };
}

/**
 * Genera los datos del panel (dashboard) para un administrador.
 */
async function getAdminDashboard() {
  const now = new Date();
  const events = await Event.find({});

  let activeEvents = 0;
  let finishedEvents = 0;

  for (const e of events) {
    if (e.status === 'cancelled') continue;
    if (isEventFinishedInRealTime(e, now)) {
      finishedEvents++;
    } else {
      activeEvents++;
    }
  }

  const [
    totalUsers,
    totalOrganizers,
    totalRegistrations,
    totalCategories,
  ] = await Promise.all([
    User.countDocuments({ role: 'usuario' }),
    User.countDocuments({ role: 'organizador' }),
    Registration.countDocuments({ status: 'confirmed' }),
    Category.countDocuments({}),
  ]);

  return {
    totalUsers,
    totalOrganizers,
    totalEvents: events.length,
    activeEvents,
    finishedEvents,
    totalRegistrations,
    totalCategories,
  };
}

// Exporta las funciones del servicio de dashboards por rol.
module.exports = {
  getUserDashboard,
  getOrganizerDashboard,
  getAdminDashboard,
};
