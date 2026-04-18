import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import * as categoryService from '../services/categroryService.js';

const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await categoryService.getAllCategories();
    res.json(new ApiResponse(200, categories, 'Categories retrieved successfully'));
})

const createCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
})

const updateCategory = asyncHandler(async (req, res) => {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.json(new ApiResponse(200, category, 'Category updated successfully'));
})

const deleteCategory = asyncHandler(async (req, res) => {
    await categoryService.deleteCategory(req.params.id);
    res.json(new ApiResponse(200, {}, 'Category deleted successfully'));
})

export {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
}