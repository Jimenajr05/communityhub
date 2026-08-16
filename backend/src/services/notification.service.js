const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

async function getUserNotifications(userId) {
  return Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('event', 'title date location');
}

async function markAsRead(notificationId, userId) {
  const notification = await Notification.findOne({ _id: notificationId, user: userId });
  if (!notification) {
    throw ApiError.notFound('Notificación no encontrada');
  }

  notification.read = true;
  await notification.save();
  return notification;
}

async function markAllAsRead(userId) {
  await Notification.updateMany({ user: userId, read: false }, { read: true });
}

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};