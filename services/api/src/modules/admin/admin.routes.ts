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
  getTransactionsAdmin,
  updateTransactionStatusAdmin,
  getStoresAdmin,
  updateStoreStatusAdmin,
  getLiveActivityAdmin,
  createAdminUserAdmin,
} from './admin.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/rbac';

const router = Router();

// All Admin routes strictly enforce authentication & admin RBAC
router.use(authenticate, requireAdmin);

router.get('/analytics', getPlatformAnalytics);
router.get('/transactions', getTransactionsAdmin);
router.patch('/transactions/:id/status', updateTransactionStatusAdmin);
router.get('/orders', getTransactionsAdmin); // Orders can use same rich transaction controller
router.patch('/orders/:id/status', updateTransactionStatusAdmin);
router.get('/stores', getStoresAdmin);
router.patch('/stores/:id/status', updateStoreStatusAdmin);
router.get('/live-activity', getLiveActivityAdmin);
router.get('/users', getUsersAdmin);
router.post('/users/create-admin', createAdminUserAdmin);
router.patch('/users/:id/status', updateUserStatusAdmin);
router.patch('/listings/:id/moderate', moderateListingAdmin);
router.patch('/verification/:id', reviewVerification);
router.patch('/payouts/:payoutId', processPayout);
router.patch('/categories/:id/commission', updateCategoryCommissionAdmin);
router.get('/audit-logs', getAuditLogs);

export default router;
