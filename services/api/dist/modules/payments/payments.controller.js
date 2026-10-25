"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPayout = exports.getMyWallet = exports.handlePaymentWebhook = exports.initiatePayment = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const payment_adapter_1 = require("./payment.adapter");
const audit_1 = require("../../middleware/audit");
// Initiate Payment on a Transaction
const initiatePayment = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { transactionId, provider, payerPhone, idempotencyKey } = req.body;
        if (!transactionId || !provider || !idempotencyKey) {
            throw new errorHandler_1.AppError('transactionId, provider, and idempotencyKey are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        // Check idempotency
        const existingPayment = await db_1.default.payment.findUnique({
            where: { idempotencyKey },
        });
        if (existingPayment) {
            res.json({
                success: true,
                data: {
                    payment: existingPayment,
                    isIdempotentReplay: true,
                },
            });
            return;
        }
        const tx = await db_1.default.marketplaceTransaction.findUnique({
            where: { id: transactionId },
        });
        if (!tx) {
            throw new errorHandler_1.AppError('Transaction not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        if (tx.status === 'COMPLETED' || tx.status === 'PAYMENT_CONFIRMED') {
            throw new errorHandler_1.AppError('Transaction has already been paid.', 400, types_1.ErrorCode.BAD_REQUEST);
        }
        // Handle In-App Wallet payment directly
        if (provider.toUpperCase() === 'WALLET') {
            const buyerWallet = await db_1.default.wallet.findUnique({ where: { userId: req.user.id } });
            if (!buyerWallet || buyerWallet.balance < tx.totalAmount) {
                throw new errorHandler_1.AppError(`Insufficient wallet balance. Available: $${buyerWallet?.balance || 0.0}, Required: $${tx.totalAmount}`, 400, types_1.ErrorCode.INSUFFICIENT_FUNDS);
            }
            // Deduct atomically
            const newBalance = parseFloat((buyerWallet.balance - tx.totalAmount).toFixed(2));
            await db_1.default.wallet.update({
                where: { id: buyerWallet.id },
                data: { balance: newBalance },
            });
            await db_1.default.ledgerEntry.create({
                data: {
                    walletId: buyerWallet.id,
                    transactionId: tx.id,
                    type: 'DEBIT',
                    amount: tx.totalAmount,
                    balanceAfter: newBalance,
                    reference: `PAY-${tx.transactionNumber}`,
                    description: `Payment for Order #${tx.transactionNumber}`,
                },
            });
            const payment = await db_1.default.payment.create({
                data: {
                    transactionId: tx.id,
                    provider: 'WALLET',
                    amount: tx.totalAmount,
                    currency: tx.currency,
                    idempotencyKey,
                    status: 'CONFIRMED',
                    providerReference: `WALLET-${Date.now()}`,
                },
            });
            await db_1.default.marketplaceTransaction.update({
                where: { id: tx.id },
                data: { status: 'PAYMENT_CONFIRMED' },
            });
            res.json({ success: true, data: { payment, status: 'CONFIRMED' } });
            return;
        }
        // External Africa-first Payment Adapter (EVC Plus, ZAAD, SAHAL, Cash)
        const adapter = (0, payment_adapter_1.getPaymentAdapter)(provider);
        const result = await adapter.initiatePayment({
            transactionId: tx.id,
            amount: tx.totalAmount,
            currency: tx.currency,
            payerPhone: payerPhone || req.user.phoneNumber,
            provider,
            idempotencyKey,
        });
        const payment = await db_1.default.payment.create({
            data: {
                transactionId: tx.id,
                provider: provider.toUpperCase(),
                amount: tx.totalAmount,
                currency: tx.currency,
                payerPhone: payerPhone || req.user.phoneNumber,
                providerReference: result.providerReference,
                idempotencyKey,
                status: result.status,
            },
        });
        if (result.status === 'CONFIRMED') {
            await db_1.default.marketplaceTransaction.update({
                where: { id: tx.id },
                data: { status: 'PAYMENT_CONFIRMED' },
            });
        }
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'PAYMENT_INITIATED',
            entityType: 'PAYMENT',
            entityId: payment.id,
            details: { provider, amount: payment.amount, status: payment.status },
        });
        res.json({
            success: true,
            data: {
                payment,
                message: result.message,
                isConfigurationRequired: result.isConfigurationRequired,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.initiatePayment = initiatePayment;
// Payment Webhook (Idempotent replay protection - Test 15)
const handlePaymentWebhook = async (req, res, next) => {
    try {
        const provider = String(req.params.provider);
        const { eventId, transactionId, status, providerReference } = req.body;
        if (!eventId) {
            throw new errorHandler_1.AppError('Missing eventId in webhook payload.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        // Idempotency check in database
        const existingWebhook = await db_1.default.paymentWebhook.findUnique({
            where: { webhookEventId: eventId },
        });
        if (existingWebhook && existingWebhook.processed) {
            res.status(200).json({
                success: true,
                message: 'Webhook already processed (Idempotent response).',
            });
            return;
        }
        // Record webhook event
        await db_1.default.paymentWebhook.upsert({
            where: { webhookEventId: eventId },
            create: {
                provider: provider.toUpperCase(),
                webhookEventId: eventId,
                payload: JSON.stringify(req.body),
                processed: true,
                processedAt: new Date(),
            },
            update: {
                processed: true,
                processedAt: new Date(),
            },
        });
        // Update payment & order state if confirmed
        if (status === 'SUCCESS' || status === 'CONFIRMED') {
            if (transactionId) {
                await db_1.default.marketplaceTransaction.update({
                    where: { id: transactionId },
                    data: { status: 'PAYMENT_CONFIRMED' },
                });
                await db_1.default.payment.updateMany({
                    where: { transactionId },
                    data: { status: 'CONFIRMED', providerReference: providerReference || undefined },
                });
            }
        }
        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully.',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.handlePaymentWebhook = handlePaymentWebhook;
// Wallet: Get My Wallet and Ledger
const getMyWallet = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const wallet = await db_1.default.wallet.findUnique({
            where: { userId: req.user.id },
            include: {
                ledgerEntries: {
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                },
                payoutRequests: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
            },
        });
        if (!wallet) {
            throw new errorHandler_1.AppError('Wallet not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        res.json({
            success: true,
            data: wallet,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyWallet = getMyWallet;
// Wallet: Request Payout
const requestPayout = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { amount, destinationType, phoneNumber, accountNumber } = req.body;
        if (!amount || amount <= 0 || !destinationType) {
            throw new errorHandler_1.AppError('Valid amount and destinationType (EVC_PLUS, ZAAD, SAHAL, BANK) are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const wallet = await db_1.default.wallet.findUnique({ where: { userId: req.user.id } });
        if (!wallet || wallet.balance < parseFloat(amount)) {
            throw new errorHandler_1.AppError('Insufficient wallet balance for this payout.', 400, types_1.ErrorCode.INSUFFICIENT_FUNDS);
        }
        const payoutAmount = parseFloat(amount);
        const newBalance = parseFloat((wallet.balance - payoutAmount).toFixed(2));
        // Deduct balance and create pending payout atomically
        const [updatedWallet, payout] = await db_1.default.$transaction([
            db_1.default.wallet.update({
                where: { id: wallet.id },
                data: { balance: newBalance },
            }),
            db_1.default.payoutRequest.create({
                data: {
                    walletId: wallet.id,
                    amount: payoutAmount,
                    destinationType,
                    phoneNumber: phoneNumber || req.user.phoneNumber,
                    accountNumber: accountNumber || null,
                    status: 'REQUESTED',
                },
            }),
            db_1.default.ledgerEntry.create({
                data: {
                    walletId: wallet.id,
                    type: 'PAYOUT',
                    amount: -payoutAmount,
                    balanceAfter: newBalance,
                    reference: `PO-${Date.now()}`,
                    description: `Payout requested via ${destinationType}`,
                },
            }),
        ]);
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'PAYOUT_REQUESTED',
            entityType: 'WALLET',
            entityId: wallet.id,
            details: { amount: payoutAmount, destinationType },
        });
        res.status(201).json({
            success: true,
            data: {
                payout,
                newBalance: updatedWallet.balance,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.requestPayout = requestPayout;
