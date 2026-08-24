const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const Event = require('../models/Event');
const ApiError = require('../utils/ApiError');

async function addFavorite(userId, eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  const existing = await Favorite.findOne({ user: userId, event: eventId });
  if (existing) {
    return existing;
  }

  return Favorite.create({ user: userId, event: eventId });
}

async function removeFavorite(userId, eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  await Favorite.deleteOne({ user: userId, event: eventId });
}

async function getUserFavorites(userId) {
  const favorites = await Favorite.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'event',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'organizer', select: 'firstName lastName email' },
      ],
    });

  return favorites;
}

async function isFavorite(userId, eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return false;
  }
  const fav = await Favorite.findOne({ user: userId, event: eventId });
  return Boolean(fav);
}

module.exports = {
  addFavorite,
  removeFavorite,
  getUserFavorites,
  isFavorite,
};