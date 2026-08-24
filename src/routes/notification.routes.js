const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

// Listar notificaciones
router.get('/', authenticate, notificationController.getNotifications);

// Marcar todas como leídas (soporta /read-all, /mark-all-read, /readall con PATCH, PUT y POST)
router.patch('/read-all', authenticate, notificationController.markAllRead);
router.put('/read-all', authenticate, notificationController.markAllRead);
router.post('/read-all', authenticate, notificationController.markAllRead);
router.patch('/mark-all-read', authenticate, notificationController.markAllRead);
router.put('/mark-all-read', authenticate, notificationController.markAllRead);
router.post('/mark-all-read', authenticate, notificationController.markAllRead);
router.patch('/readall', authenticate, notificationController.markAllRead);
router.put('/readall', authenticate, notificationController.markAllRead);
router.post('/readall', authenticate, notificationController.markAllRead);

// Marcar una como leída (soporta /:id/read y /:id con PATCH, PUT y POST)
router.patch('/:id/read', authenticate, notificationController.markRead);
router.put('/:id/read', authenticate, notificationController.markRead);
router.post('/:id/read', authenticate, notificationController.markRead);
router.patch('/:id', authenticate, notificationController.markRead);
router.put('/:id', authenticate, notificationController.markRead);
router.post('/:id', authenticate, notificationController.markRead);

module.exports = router;