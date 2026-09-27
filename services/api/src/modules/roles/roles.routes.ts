import { Router } from 'express';
import { listRoles, requestRole, assignRole } from './roles.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/rbac';

const router = Router();

// Public roles listing
router.get('/', listRoles);

// User role capability requests
router.post('/request', authenticate, requestRole);

// Admin role assignment guard
router.post('/assign', authenticate, requireAdmin, assignRole);

export default router;
