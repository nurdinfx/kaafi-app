import { Router } from 'express';
import { getStoreBySlug, createBusinessStore, addStoreBranch, addStoreEmployee } from './stores.controller';
import { authenticate } from '../../middleware/auth';
import { requireBusinessOwnership } from '../../middleware/tenant';

const router = Router();

router.get('/:slug', getStoreBySlug);
router.post('/', authenticate, createBusinessStore);
router.post('/:businessId/branches', authenticate, requireBusinessOwnership, addStoreBranch);
router.post('/:businessId/employees', authenticate, requireBusinessOwnership, addStoreEmployee);

export default router;
