import { Category } from '../models/category.model.js';
import { ApiError } from '../utils/ApiError.js';

export async function getAllCategories() {
  return Category.find({ isActive: true }).select('-__v').sort({ name: 1 });
}

export async function createCategory(body) {
  const { name, slug, icon, suggestedMaxPrice } = body;

  const existing = await Category.findOne({ slug });
  if (existing) {
    throw new ApiError(409, 'CATEGORY_EXISTS', 'A category with this slug already exists');
  }

  return Category.create({ name, slug, icon, suggestedMaxPrice });
}

export async function updateCategory(categoryId, body) {
  const category = await Category.findByIdAndUpdate(categoryId, body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
  }

  return category;
}

export async function deleteCategory(categoryId) {
  const category = await Category.findByIdAndUpdate(
    categoryId,
    { isActive: false },   // soft delete — don't break existing listings
    { new: true }
  );

  if (!category) {
    throw new ApiError(404, 'CATEGORY_NOT_FOUND', 'Category not found');
  }
}