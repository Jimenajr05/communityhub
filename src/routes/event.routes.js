const express = require('express');
const eventController = require('../controllers/event.controller');
const registrationController = require('../controllers/registration.controller');
const favoriteController = require('../controllers/favorite.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Públicas: cualquiera puede ver el listado y el detalle de actividades
router.get('/', eventController.list);
router.get('/:id', eventController.getById);

// Protegidas: inscripciones
router.post('/:id/register', authenticate, registrationController.registerToEvent);
router.delete('/:id/register', authenticate, registrationController.cancelRegistration);
router.get('/:id/register/status', authenticate, registrationController.checkStatus);

// Protegidas: favoritos
router.post('/:id/favorite', authenticate, favoriteController.addFavorite);
router.delete('/:id/favorite', authenticate, favoriteController.removeFavorite);
router.get('/:id/favorite/status', authenticate, favoriteController.checkStatus);

// Protegidas: solo organizadores y admins pueden consultar participantes o crear/editar/eliminar.
router.get('/:id/participants', authenticate, authorize('organizador', 'administrador'), registrationController.getParticipants);
router.post('/', authenticate, authorize('organizador', 'administrador'), eventController.create);
router.put('/:id', authenticate, authorize('organizador', 'administrador'), eventController.update);
router.delete('/:id', authenticate, authorize('organizador', 'administrador'), eventController.remove);

module.exports = router;