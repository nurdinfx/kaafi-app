"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyTransactions = exports.getTransactionById = exports.updateTransactionStatus = exports.createTransaction = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const audit_1 = require("../../middleware/audit");
// Valid Order State Transitions Map
const VALID_TRANSITIONS = {
    DRAFT: ['PENDING_PAYMENT', 'CANCELLED'],
    PENDING_PAYMENT: ['PAYMENT_CONFIRMED', 'CANCELLED'],
    PAYMENT_CONFIRMED: ['ACCEPTED', 'CANCELLED', 'REFUND_PENDING'],
    ACCEPTED: ['PREPARING', 'CANCELLED', 'DISPUTED'],
    PREPARING: ['READY', 'CANCELLED', 'DISPUTED'],
    READY: ['ASSIGNED', 'PICKED_UP', 'DELIVERED', 'COMPLETED'],
    ASSIGNED: ['PICKED_UP', 'CANCELLED'],
    PICKED_UP: ['IN_TRANSIT', 'DISPUTED'],
    IN_TRANSIT: ['DELIVERED', 'DISPUTED'],
    DELIVERED: ['COMPLETED', 'DISPUTED'],
    COMPLETED: ['DISPUTED'],
    CANCELLED: [],
    REFUNDED: [],
    DISPUTED: ['RESOLVED', 'CLOSED', 'REFUNDED'],
};
// Direct Purchase / Create Transaction
const createTransaction = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { items, fulfillmentType = 'CUSTOMER_PICKUP', deliveryCity = 'Garoowe', deliveryDistrict, deliveryLandmark, recipientPhone } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new errorHandler_1.AppError('Items array is required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        // Validate listings & inventory and calculate verified pricing server-side
        let subtotal = 0;
        const validatedItems = [];
        for (const item of items) {
            const listing = await db_1.default.listing.findUnique({
                where: { id: item.listingId },
                include: { category: true },
            });
            if (!listing || listing.status !== 'ACTIVE') {
                throw new errorHandler_1.AppError(`Listing ${item.listingId} is no longer available.`, 400, types_1.ErrorCode.BAD_REQUEST);
            }
            const qty = parseInt(item.quantity, 10) || 1;
            if (listing.inventoryCount < qty) {
                throw new errorHandler_1.AppError(`Insufficient stock for "${listing.title}". Available: ${listing.inventoryCount}`, 400, types_1.ErrorCode.BAD_REQUEST);
            }
            const unitPrice = listing.price;
            const lineTotal = unitPrice * qty;
            subtotal += lineTotal;
            validatedItems.push({
                listingId: listing.id,
                sellerId: listing.sellerId,
                quantity: qty,
                unitPrice,
                totalPrice: lineTotal,
                currency: listing.currency,
                categoryCommissionRate: listing.category.commissionRate || 5.0,
            });
        }
        // Calculate delivery fee
        const deliveryFee = fulfillmentType === 'DRIVER_DELIVERY' ? 2.5 : 0.0;
        // Calculate commission based on category rate
        const avgCommissionRate = validatedItems[0]?.categoryCommissionRate || 5.0;
        const commissionAmount = parseFloat(((subtotal * avgCommissionRate) / 100).toFixed(2));
        const totalAmount = subtotal + deliveryFee;
        const txNumber = `ORD-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const transaction = await db_1.default.marketplaceTransaction.create({
            data: {
                transactionNumber: txNumber,
                buyerId: req.user.id,
                transactionType: 'DIRECT_PURCHASE',
                subtotalAmount: subtotal,
                deliveryFee,
                commissionAmount,
                commissionRateUsed: avgCommissionRate,
                totalAmount,
                currency: 'USD',
                fulfillmentType,
                deliveryCity,
                deliveryDistrict: deliveryDistrict || null,
                deliveryLandmark: deliveryLandmark || null,
                recipientPhone: recipientPhone || req.user.phoneNumber,
                status: 'PENDING_PAYMENT',
                items: {
                    create: validatedItems.map((item) => ({
                        listingId: item.listingId,
                        sellerId: item.sellerId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        currency: item.currency,
                    })),
                },
                statusHistory: {
                    create: {
                        fromStatus: 'DRAFT',
                        toStatus: 'PENDING_PAYMENT',
                        notes: 'Transaction created by buyer.',
                        changedBy: req.user.id,
                    },
                },
            },
            include: {
                items: true,
            },
        });
        // If driver delivery, create pending delivery job with proof of delivery PIN
        if (fulfillmentType === 'DRIVER_DELIVERY') {
            const pin = Math.floor(1000 + Math.random() * 9000).toString();
            await db_1.default.deliveryJob.create({
                data: {
                    transactionId: transaction.id,
                    pickupLandmark: 'Merchant Store',
                    pickupCity: deliveryCity,
                    dropoffLandmark: deliveryLandmark || 'Customer Landmark',
                    dropoffCity: deliveryCity,
                    fee: deliveryFee,
                    deliveryPin: pin,
                    status: 'SEARCHING_DRIVER',
                },
            });
        }
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'TRANSACTION_CREATED',
            entityType: 'TRANSACTION',
            entityId: transaction.id,
            details: { totalAmount, itemsCount: validatedItems.length },
        });
        res.status(201).json({
            success: true,
            data: transaction,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createTransaction = createTransaction;
// Transition Transaction State (Server-enforced state machine)
const updateTransactionStatus = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const id = String(req.params.id);
        const toStatus = req.body.toStatus || req.body.status;
        const { notes } = req.body;
        if (!toStatus) {
            throw new errorHandler_1.AppError('toStatus (or status) is required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const tx = await db_1.default.marketplaceTransaction.findUnique({
            where: { id },
            include: { items: true },
        });
        if (!tx) {
            throw new errorHandler_1.AppError('Transaction not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        // Verify valid state transition
        const allowedNext = VALID_TRANSITIONS[tx.status] || [];
        if (!allowedNext.includes(toStatus) && !req.user.roles.includes('SUPER_ADMIN')) {
            throw new errorHandler_1.AppError(`Invalid status transition from '${tx.status}' to '${toStatus}'. Allowed: [${allowedNext.join(', ')}]`, 400, types_1.ErrorCode.BAD_REQUEST);
        }
        const updatedTx = await db_1.default.marketplaceTransaction.update({
            where: { id },
            data: {
                status: toStatus,
                statusHistory: {
                    create: {
                        fromStatus: tx.status,
                        toStatus,
                        notes: notes || null,
                        changedBy: req.user.id,
                    },
                },
            },
        });
        // If transitioned to COMPLETED, credit the sellers' wallets
        if (toStatus === 'COMPLETED' && tx.status !== 'COMPLETED') {
            for (const item of tx.items) {
                const itemShare = item.totalPrice;
                const commissionDeduction = (itemShare * tx.commissionRateUsed) / 100;
                const sellerNetEarnings = parseFloat((itemShare - commissionDeduction).toFixed(2));
                let sellerWallet = await db_1.default.wallet.findUnique({ where: { userId: item.sellerId } });
                if (!sellerWallet) {
                    sellerWallet = await db_1.default.wallet.create({
                        data: { userId: item.sellerId, balance: 0.0, pendingBalance: 0.0 },
                    });
                }
                const newBalance = parseFloat((sellerWallet.balance + sellerNetEarnings).toFixed(2));
                await db_1.default.wallet.update({
                    where: { id: sellerWallet.id },
                    data: { balance: newBalance },
                });
                await db_1.default.ledgerEntry.create({
                    data: {
                        walletId: sellerWallet.id,
                        transactionId: tx.id,
                        type: 'CREDIT',
                        amount: sellerNetEarnings,
                        balanceAfter: newBalance,
                        reference: `CR-${tx.transactionNumber}-${item.id}`,
                        description: `Earnings for order #${tx.transactionNumber} (Net of ${tx.commissionRateUsed}% commission)`,
                    },
                });
            }
        }
        res.json({
            success: true,
            data: updatedTx,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTransactionStatus = updateTransactionStatus;
// Get single transaction by ID
const getTransactionById = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const id = String(req.params.id);
        const tx = await db_1.default.marketplaceTransaction.findUnique({
            where: { id },
            include: {
                buyer: { select: { id: true, fullName: true, phoneNumber: true, avatarUrl: true, city: true } },
                items: {
                    include: {
                        listing: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                price: true,
                                currency: true,
                                media: { take: 2, orderBy: { sortOrder: 'asc' } },
                                category: { select: { name: true, verticalType: true } },
                            },
                        },
                    },
                },
                deliveryJob: {
                    include: {
                        driver: {
                            include: { user: { select: { id: true, fullName: true, phoneNumber: true } } },
                        },
                    },
                },
                payments: true,
                statusHistory: { orderBy: { createdAt: 'asc' } },
                disputes: { orderBy: { createdAt: 'desc' } },
                escrowHold: true,
            },
        });
        if (!tx) {
            throw new errorHandler_1.AppError('Transaction not found', 404, types_1.ErrorCode.NOT_FOUND);
        }
        const isSeller = tx.items.some((item) => item.sellerId === req.user?.id);
        const isBuyer = tx.buyerId === req.user.id;
        const isAdmin = req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('FINANCE_ADMIN');
        if (!isBuyer && !isSeller && !isAdmin) {
            throw new errorHandler_1.AppError('Unauthorized access to transaction.', 403, types_1.ErrorCode.FORBIDDEN);
        }
        res.json({
            success: true,
            data: tx,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTransactionById = getTransactionById;
// Get user transactions (as buyer or seller)
const getMyTransactions = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const roleQuery = String(req.query.role || 'BUYER').toUpperCase();
        let where = {};
        if (roleQuery === 'BUYER') {
            where.buyerId = req.user.id;
        }
        else {
            where.items = { some: { sellerId: req.user.id } };
        }
        const transactions = await db_1.default.marketplaceTransaction.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        listing: { select: { id: true, title: true, slug: true, media: { take: 1, orderBy: { sortOrder: 'asc' } } } },
                    },
                },
                deliveryJob: true,
                payments: true,
            },
        });
        res.json({
            success: true,
            data: transactions,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyTransactions = getMyTransactions;
