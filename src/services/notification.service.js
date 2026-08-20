const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

async function getUserNotifications(userId) {
  return Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('event', 'title date location');
}

async function markAsRead(notificationId, userId) {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw ApiError.notFound('Notificación no encontrada');
  }

  const notification = await Notification.findOne({ _id: notificationId, user: userId });
  if (!notification) {
    throw ApiError.notFound('Notificación no encontrada');
  }

  notification.read = true;
  await notification.save();
  await notification.populate('event', 'title date location');
  return notification;
}

async function markAllAsRead(userId) {
  await Notification.updateMany({ user: userId }, { $set: { read: true } });
}

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};