const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');

async function getAllCategories() {
  return Category.find().sort({ name: 1 });
}

async function getCategoryById(id) {
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Categoría no encontrada');
  }
  return category;
}

async function createCategory(payload) {
  if (!payload.name || !payload.name.trim()) {
    throw ApiError.badRequest('El nombre de la categoría es obligatorio');
  }

  const existing = await Category.findOne({ name: payload.name.trim() });
  if (existing) {
    throw ApiError.conflict('Ya existe una categoría con este nombre');
  }

  return Category.create(payload);
}

async function updateCategory(id, payload) {
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Categoría no encontrada');
  }

  if (payload.name !== undefined && !payload.name.trim()) {
    throw ApiError.badRequest('El nombre de la categoría no puede estar vacío');
  }

  if (payload.name && payload.name.trim() !== category.name) {
    const existing = await Category.findOne({ name: payload.name.trim() });
    if (existing) {
      throw ApiError.conflict('Ya existe una categoría con este nombre');
    }
  }

  Object.assign(category, payload);
  await category.save();
  return category;
}

async function deleteCategory(id) {
  const category = await Category.findById(id);
  if (!category) {
    throw ApiError.notFound('Categoría no encontrada');
  }

  await category.deleteOne();
}

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};