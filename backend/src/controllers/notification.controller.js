const notificationService = require('../services/notification.service');

async function getNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    res.json({
      success: true,
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);
    res.json({
      success: true,
      data: { notification },
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