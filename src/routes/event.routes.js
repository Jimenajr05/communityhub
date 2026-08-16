const express = require('express');
const eventController = require('../controllers/event.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Públicas: cualquiera puede ver el listado y el detalle de actividades,
// sin necesidad de iniciar sesión.
router.get('/', eventController.list);
router.get('/:id', eventController.getById);

// Protegidas: solo organizadores y admins pueden crear/editar/eliminar.
// La verificación de que sea EL DUEÑO del evento (o admin) vive en el
// servicio, no aquí, porque requiere cargar el documento primero.
router.post('/', authenticate, authorize('organizer', 'admin'), eventController.create);
router.put('/:id', authenticate, authorize('organizer', 'admin'), eventController.update);
router.delete('/:id', authenticate, authorize('organizer', 'admin'), eventController.remove);

module.exports = router;