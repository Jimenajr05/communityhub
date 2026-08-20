const notificationService = require('../services/notification.service');

async function getNotifications(req, res, next) {
  try {
    const raw = await notificationService.getUserNotifications(req.user.id);
    const notifications = raw.map((n) => (n.toJSON ? n.toJSON() : n));
    res.json({
      success: true,
      data: { notifications },
      notifications, // alias directo para compatibilidad con stores de frontend
    });
  } catch (error) {
    next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const explicitRead =
      req.body && req.body.read !== undefined
        ? req.body.read
        : req.body && req.body.isRead !== undefined
        ? req.body.isRead
        : true;

    const raw = await notificationService.markAsRead(req.params.id, req.user.id, explicitRead);
    const notification = raw.toJSON ? raw.toJSON() : raw;

    res.json({
      success: true,
      message: 'Notificación actualizada correctamente',
      data: { notification },
      notification, // alias directo
    });
  } catch (error) {
    next(error);
  }
}

async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({
      success: true,
      message: 'Todas las notificaciones fueron marcadas como leídas',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
};