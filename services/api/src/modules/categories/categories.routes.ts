import { Router } from 'express';
import { getCategories, getCategoryBySlug, createCategory, approveCategory, addCategoryAttribute } from './categories.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/rbac';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
// Authenticated users and admins can create categories (users get WAIT status, admins get ACTIVE)
router.post('/', authenticate, createCategory);
router.patch('/:categoryId/approve', authenticate, requireAdmin, approveCategory);
router.post('/:categoryId/attributes', authenticate, requireAdmin, addCategoryAttribute);

export default router;
