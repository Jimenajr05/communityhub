const express = require('express');
const categoryController = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// GET públicas
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);

// Operaciones reservadas para administradores
router.post('/', authenticate, authorize('administrador'), categoryController.createCategory);
router.put('/:id', authenticate, authorize('administrador'), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('administrador'), categoryController.deleteCategory);

module.exports = router;