import { Router } from 'express';
import {
  getPlatformAnalytics,
  reviewVerification,
  processPayout,
  getAuditLogs,
  getUsersAdmin,
  updateUserStatusAdmin,
  moderateListingAdmin,
  updateCategoryCommissionAdmin,
} from './admin.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/rbac';

const router = Router();

// All Admin routes strictly enforce authentication & admin RBAC
router.use(authenticate, requireAdmin);

router.get('/analytics', getPlatformAnalytics);
router.get('/users', getUsersAdmin);
router.patch('/users/:id/status', updateUserStatusAdmin);
router.patch('/listings/:id/moderate', moderateListingAdmin);
router.patch('/verification/:id', reviewVerification);
router.patch('/payouts/:payoutId', processPayout);
router.patch('/categories/:id/commission', updateCategoryCommissionAdmin);
router.get('/audit-logs', getAuditLogs);

export default router;
