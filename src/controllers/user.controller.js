const userService = require('../services/user.service');

async function getUsers(req, res, next) {
  try {
    const users = await userService.getAllUsers();
    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const user = await userService.updateUser(req.params.id, req.body, req.user);
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    await userService.deleteUser(req.params.id);
    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};