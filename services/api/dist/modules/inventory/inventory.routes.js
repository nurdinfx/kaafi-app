"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("./inventory.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// All inventory endpoints require authentication
router.use(auth_1.authenticate);
router.post('/movement', inventory_controller_1.recordStockMovement);
router.post('/transfer', inventory_controller_1.transferBranchStock);
router.get('/movements/:listingId', inventory_controller_1.getListingStockMovements);
router.get('/alerts/low-stock', inventory_controller_1.getLowStockAlerts);
router.post('/variants', inventory_controller_1.createProductVariant);
exports.default = router;
