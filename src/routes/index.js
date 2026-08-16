const express = require('express');
const authRoutes = require('./auth.routes');
const eventRoutes = require('./event.routes');
const categoryRoutes = require('./category.routes');
const userRoutes = require('./user.routes');
const dashboardRoutes = require('./dashboard.routes');
const notificationRoutes = require('./notification.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;