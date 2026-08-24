const favoriteService = require('../services/favorite.service');

async function addFavorite(req, res, next) {
  try {
    const favorite = await favoriteService.addFavorite(req.user.id, req.params.id);
    res.status(201).json({
      success: true,
      message: 'Actividad guardada en favoritos',
      data: { favorite },
    });
  } catch (error) {
    next(error);
  }
}

async function removeFavorite(req, res, next) {
  try {
    await favoriteService.removeFavorite(req.user.id, req.params.id);
    res.json({
      success: true,
      message: 'Actividad removida de favoritos',
    });
  } catch (error) {
    next(error);
  }
}

async function getMyFavorites(req, res, next) {
  try {
    const favorites = await favoriteService.getUserFavorites(req.user.id);
    res.json({
      success: true,
      data: { favorites },
    });
  } catch (error) {
    next(error);
  }
}

async function checkStatus(req, res, next) {
  try {
    const isFavorite = await favoriteService.isFavorite(req.user.id, req.params.id);
    res.json({
      success: true,
      data: { isFavorite },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkStatus,
};