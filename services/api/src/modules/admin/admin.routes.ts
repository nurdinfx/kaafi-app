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
  deleteStoreAdmin,
  getLiveActivityAdmin,
  createAdminUserAdmin,
  // New: Listings Management
  adminGetAllListings,
  adminCreateListing,
  adminUpdateListing,
  adminDeleteListing,
  // New: Category Management
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  // New: System Data Clear
  adminClearSystemData,
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
router.delete('/stores/:id', deleteStoreAdmin);
router.get('/live-activity', getLiveActivityAdmin);
router.get('/users', getUsersAdmin);
router.post('/users/create-admin', createAdminUserAdmin);
router.patch('/users/:id/status', updateUserStatusAdmin);
router.patch('/listings/:id/moderate', moderateListingAdmin);
router.patch('/verification/:id', reviewVerification);
router.patch('/payouts/:payoutId', processPayout);
router.patch('/categories/:id/commission', updateCategoryCommissionAdmin);
router.get('/audit-logs', getAuditLogs);

// ── Admin: Full Listing Management (No Store Required) ──────────────────────
router.get('/manage/listings', adminGetAllListings);
router.post('/manage/listings', adminCreateListing);
router.patch('/manage/listings/:id', adminUpdateListing);
router.delete('/manage/listings/:id', adminDeleteListing);

// ── Admin: Full Category Management ─────────────────────────────────────────
router.get('/manage/categories', adminGetCategories);
router.post('/manage/categories', adminCreateCategory);
router.patch('/manage/categories/:id', adminUpdateCategory);
router.delete('/manage/categories/:id', adminDeleteCategory);

// ── Admin: System Data Clear / Wipe ─────────────────────────────────────────
router.post('/system/clear-data', adminClearSystemData);

export default router;

