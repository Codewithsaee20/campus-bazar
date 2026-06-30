import {Router} from 'express'
import { createCategory, deleteCategory, getAllCategories, updateCategory } from '../controllers/categoryController.js'
import { authorizeRoles , verifyToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getAllCategories);
router.post('/', verifyToken, authorizeRoles('admin'), createCategory);
router.put('/:id', verifyToken, authorizeRoles('admin'), updateCategory);
router.delete('/:id', verifyToken, authorizeRoles('admin'), deleteCategory);

export default router