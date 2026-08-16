const categoryService = require('../services/category.service');

async function getCategories(req, res, next) {
  try {
    const categories = await categoryService.getAllCategories();
    res.json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
}

async function getCategory(req, res, next) {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({
      success: true,
      message: 'Categoría creada exitosamente',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Categoría actualizada exitosamente',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};