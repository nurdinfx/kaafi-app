"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const router = (0, express_1.Router)();
// All Admin routes strictly enforce authentication & admin RBAC
router.use(auth_1.authenticate, rbac_1.requireAdmin);
router.get('/analytics', admin_controller_1.getPlatformAnalytics);
router.get('/transactions', admin_controller_1.getTransactionsAdmin);
router.patch('/transactions/:id/status', admin_controller_1.updateTransactionStatusAdmin);
router.get('/orders', admin_controller_1.getTransactionsAdmin); // Orders can use same rich transaction controller
router.patch('/orders/:id/status', admin_controller_1.updateTransactionStatusAdmin);
router.get('/stores', admin_controller_1.getStoresAdmin);
router.patch('/stores/:id/status', admin_controller_1.updateStoreStatusAdmin);
router.get('/live-activity', admin_controller_1.getLiveActivityAdmin);
router.get('/users', admin_controller_1.getUsersAdmin);
router.post('/users/create-admin', admin_controller_1.createAdminUserAdmin);
router.patch('/users/:id/status', admin_controller_1.updateUserStatusAdmin);
router.patch('/listings/:id/moderate', admin_controller_1.moderateListingAdmin);
router.patch('/verification/:id', admin_controller_1.reviewVerification);
router.patch('/payouts/:payoutId', admin_controller_1.processPayout);
router.patch('/categories/:id/commission', admin_controller_1.updateCategoryCommissionAdmin);
router.get('/audit-logs', admin_controller_1.getAuditLogs);
// ── Admin: Full Listing Management (No Store Required) ──────────────────────
router.get('/manage/listings', admin_controller_1.adminGetAllListings);
router.post('/manage/listings', admin_controller_1.adminCreateListing);
router.patch('/manage/listings/:id', admin_controller_1.adminUpdateListing);
router.delete('/manage/listings/:id', admin_controller_1.adminDeleteListing);
// ── Admin: Full Category Management ─────────────────────────────────────────
router.get('/manage/categories', admin_controller_1.adminGetCategories);
router.post('/manage/categories', admin_controller_1.adminCreateCategory);
router.patch('/manage/categories/:id', admin_controller_1.adminUpdateCategory);
router.delete('/manage/categories/:id', admin_controller_1.adminDeleteCategory);
// ── Admin: System Data Clear / Wipe ─────────────────────────────────────────
router.post('/system/clear-data', admin_controller_1.adminClearSystemData);
exports.default = router;
