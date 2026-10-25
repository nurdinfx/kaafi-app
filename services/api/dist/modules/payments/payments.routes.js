"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payments_controller_1 = require("./payments.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Payment endpoints
router.post('/initiate', auth_1.authenticate, payments_controller_1.initiatePayment);
router.post('/webhook/:provider', payments_controller_1.handlePaymentWebhook);
// Wallet & Payout endpoints
router.get('/wallet/me', auth_1.authenticate, payments_controller_1.getMyWallet);
router.post('/wallet/payout', auth_1.authenticate, payments_controller_1.requestPayout);
exports.default = router;
