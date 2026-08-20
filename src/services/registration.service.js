const mongoose = require('mongoose');
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const ApiError = require('../utils/ApiError');

async function registerToEvent(userId, eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  if (event.status !== 'active') {
    throw ApiError.badRequest('No es posible inscribirse a una actividad cancelada o finalizada');
  }

  if (new Date(event.date) < new Date()) {
    throw ApiError.badRequest('No puedes inscribirte a una actividad que ya ha transcurrido');
  }

  // Verificar si el usuario ya está inscrito
  const existingRegistration = await Registration.findOne({
    user: userId,
    event: eventId,
  });

  if (existingRegistration && existingRegistration.status === 'confirmed') {
    throw ApiError.conflict('Ya te encuentras inscrito en esta actividad');
  }

  // Comprobar disponibilidad de espacios
  const registeredCount = await Registration.countDocuments({
    event: eventId,
    status: 'confirmed',
  });

  if (registeredCount >= event.capacity) {
    throw ApiError.badRequest('La actividad no tiene cupos disponibles');
  }

  let registration;
  if (existingRegistration) {
    existingRegistration.status = 'confirmed';
    await existingRegistration.save();
    registration = existingRegistration;
  } else {
    registration = await Registration.create({
      user: userId,
      event: eventId,
      status: 'confirmed',
    });
  }

  await Notification.create({
    user: userId,
    event: eventId,
    type: 'registration',
    message: `Te inscribiste correctamente en "${event.title}".`,
  });

  return registration;
}

async function cancelRegistration(userId, eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  const registration = await Registration.findOne({
    user: userId,
    event: eventId,
    status: 'confirmed',
  });

  if (!registration) {
    throw ApiError.notFound('No tienes una inscripción activa para esta actividad');
  }

  registration.status = 'cancelled';
  await registration.save();

  const event = await Event.findById(eventId);
  await Notification.create({
    user: userId,
    event: eventId,
    type: 'cancellation_user',
    message: `Cancelaste tu inscripción en "${event ? event.title : 'la actividad'}".`,
  });
}

async function getUserRegistrations(userId, statusFilter) {
  // Sin filtro: devuelve el historial completo (confirmed + cancelled)
  // Con ?status=confirmed o ?status=cancelled: filtra por estado
  const query = { user: userId };
  if (statusFilter && ['confirmed', 'cancelled'].includes(statusFilter)) {
    query.status = statusFilter;
  }

  const registrations = await Registration.find(query)
    .sort({ createdAt: -1 })
    .populate({
      path: 'event',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'organizer', select: 'firstName lastName email' },
      ],
    });

  return registrations;
}

async function getRegistrationStatus(userId, eventId) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return false;
  }
  const registration = await Registration.findOne({
    user: userId,
    event: eventId,
    status: 'confirmed',
  });
  return Boolean(registration);
}

async function getEventParticipants(eventId, requester) {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw ApiError.notFound('Actividad no encontrada');
  }

  const isOwner = event.organizer.toString() === requester.id.toString();
  const isAdmin = requester.role === 'administrador';
  if (!isOwner && !isAdmin) {
    throw ApiError.forbidden('Solo el organizador de este evento o un administrador pueden ver la lista de participantes');
  }

  const registrations = await Registration.find({
    event: eventId,
    status: 'confirmed',
  })
    .sort({ createdAt: -1 })
    .populate('user', 'firstName lastName email profilePicture');

  return {
    event: {
      id: event._id,
      title: event.title,
      capacity: event.capacity,
      spotsAvailable: Math.max(event.capacity - registrations.length, 0),
    },
    totalParticipants: registrations.length,
    participants: registrations.map((r) => ({
      registrationId: r._id,
      user: r.user,
      registeredAt: r.createdAt,
    })),
  };
}

module.exports = {
  registerToEvent,
  cancelRegistration,
  getUserRegistrations,
  getRegistrationStatus,
  getEventParticipants,
};