import { Router } from 'express';
import { getCategories, getCategoryBySlug, createCategory, addCategoryAttribute } from './categories.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/rbac';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', authenticate, requireAdmin, createCategory);
router.post('/:categoryId/attributes', authenticate, requireAdmin, addCategoryAttribute);

export default router;
