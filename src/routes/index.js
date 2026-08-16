const express = require('express');
const authRoutes = require('./auth.routes');
const eventRoutes = require('./event.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);

// Próximas rutas a integrar: users, categories, registrations, favorites, notifications

module.exports = router;