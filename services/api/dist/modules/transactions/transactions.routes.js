"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactions_controller_1 = require("./transactions.controller");
const payments_controller_1 = require("../payments/payments.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Wallet aliases under transactions for frontend convenience
router.get('/wallet/me', auth_1.authenticate, payments_controller_1.getMyWallet);
router.post('/wallet/payout', auth_1.authenticate, payments_controller_1.requestPayout);
// Transaction endpoints
router.get('/', auth_1.authenticate, transactions_controller_1.getMyTransactions);
router.get('/:id', auth_1.authenticate, transactions_controller_1.getTransactionById);
router.post('/', auth_1.authenticate, transactions_controller_1.createTransaction);
router.patch('/:id/status', auth_1.authenticate, transactions_controller_1.updateTransactionStatus);
exports.default = router;
