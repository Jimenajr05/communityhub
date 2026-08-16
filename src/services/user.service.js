const User = require('../models/User');
const ApiError = require('../utils/ApiError');

function sanitizeUser(user) {
  const plain = user.toObject ? user.toObject() : user;
  delete plain.password;
  return plain;
}

async function getAllUsers() {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  return users;
}

async function getUserById(id) {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw ApiError.notFound('Usuario no encontrado');
  }
  return user;
}

async function updateUser(id, payload, requester) {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('Usuario no encontrado');
  }

  // Prevenir cambio de email a uno en uso
  if (payload.email && payload.email !== user.email) {
    const existing = await User.findOne({ email: payload.email.toLowerCase() });
    if (existing) {
      throw ApiError.conflict('El correo electrónico ya está registrado');
    }
  }

  // Actualizar solo los campos permitidos
  if (payload.firstName) user.firstName = payload.firstName;
  if (payload.lastName) user.lastName = payload.lastName;
  if (payload.email) user.email = payload.email.toLowerCase();
  // Solo un administrador puede cambiar el rol de un usuario; de lo contrario
  // cualquier usuario autenticado podría auto-promoverse a admin.
  if (payload.role) {
    if (!requester || requester.role !== 'administrador') {
      throw ApiError.forbidden('No tiene permisos para cambiar el rol de un usuario');
    }
    user.role = payload.role;
  }
  if (payload.profilePicture !== undefined) user.profilePicture = payload.profilePicture;

  await user.save();
  return sanitizeUser(user);
}

async function deleteUser(id) {
  const user = await User.findById(id);
  if (!user) {
    throw ApiError.notFound('Usuario no encontrado');
  }

  await user.deleteOne();
}

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};