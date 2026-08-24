const express = require('express');
const userController = require('../controllers/user.controller');
const registrationController = require('../controllers/registration.controller');
const favoriteController = require('../controllers/favorite.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const upload = require('../middleware/upload.middleware');

const router = express.Router();

// Rutas de usuario autenticado actual (me)
router.get('/me/registrations', authenticate, registrationController.getMyRegistrations);
router.get('/me/favorites', authenticate, favoriteController.getMyFavorites);
router.post('/me/avatar', authenticate, upload.single('avatar'), userController.uploadAvatar);

// Un usuario solo puede leer/editar su propio perfil; el admin puede cualquiera.
function ownProfileOrAdmin(req, res, next) {
  if (req.user.role === 'administrador' || req.user.id.toString() === req.params.id) {
    return next();
  }
  return next(require('../utils/ApiError').forbidden('No tiene permisos para realizar esta acción'));
}

// Rutas de administración de usuarios (admin)
router.get('/', authenticate, authorize('administrador'), userController.getUsers);
router.get('/:id', authenticate, ownProfileOrAdmin, userController.getUser);
router.put('/:id', authenticate, ownProfileOrAdmin, userController.updateUser);
router.delete('/:id', authenticate, authorize('administrador'), userController.deleteUser);

module.exports = router;