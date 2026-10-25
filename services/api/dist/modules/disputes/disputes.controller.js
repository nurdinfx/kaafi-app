"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDisputes = exports.resolveDispute = exports.submitSellerResponse = exports.openDispute = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const audit_1 = require("../../middleware/audit");
// ----------------------------------------------------
// MULTI-STATE DISPUTE & ARBITRATION ENGINE
// ----------------------------------------------------
/**
 * Customer opens a dispute on a completed, placed, or in-transit transaction
 */
const openDispute = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { transactionId, reason, details, evidenceUrl } = req.body;
        if (!transactionId || !reason || !details) {
            throw new errorHandler_1.AppError('transactionId, reason, and details are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const tx = await db_1.default.marketplaceTransaction.findUnique({
            where: { id: transactionId },
            include: { items: { include: { listing: true } } },
        });
        if (!tx) {
            throw new errorHandler_1.AppError('Transaction not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        // Only the buyer or super admin can open a dispute
        if (tx.buyerId !== req.user.id && !req.user.roles.includes('SUPER_ADMIN')) {
            throw new errorHandler_1.AppError('Only the buyer can open a dispute for this order.', 403, types_1.ErrorCode.FORBIDDEN);
        }
        // Check if open dispute already exists
        const existingDispute = await db_1.default.dispute.findFirst({
            where: {
                transactionId,
                status: { in: ['OPEN', 'UNDER_REVIEW', 'SELLER_RESPONSE_REQUIRED', 'BUYER_RESPONSE_REQUIRED'] },
            },
        });
        if (existingDispute) {
            throw new errorHandler_1.AppError('An active dispute is already open for this transaction.', 400, types_1.ErrorCode.BAD_REQUEST);
        }
        const dispute = await db_1.default.dispute.create({
            data: {
                transactionId,
                raisedById: req.user.id,
                reason,
                details,
                evidenceUrl: evidenceUrl || null,
                status: 'SELLER_RESPONSE_REQUIRED',
            },
        });
        // Mark transaction as DISPUTED
        await db_1.default.marketplaceTransaction.update({
            where: { id: transactionId },
            data: { status: 'DISPUTED' },
        });
        // If escrow hold exists, put it in DISPUTE_HOLD
        await db_1.default.escrowHold.updateMany({
            where: { transactionId },
            data: { status: 'DISPUTE_HOLD' },
        });
        // Notify sellers in this transaction
        const sellerIds = [...new Set(tx.items.map((i) => i.sellerId))];
        for (const sellerId of sellerIds) {
            await db_1.default.notification.create({
                data: {
                    userId: sellerId,
                    type: 'TRANSACTION',
                    title: `Dispute Opened on Order #${tx.transactionNumber}`,
                    message: `The buyer has opened a dispute (${reason}). Please review and provide your response within 48 hours.`,
                    linkUrl: `/seller/disputes/${dispute.id}`,
                },
            });
        }
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'DISPUTE_OPENED',
            entityType: 'DISPUTE',
            entityId: dispute.id,
            details: { transactionNumber: tx.transactionNumber, reason },
        });
        res.status(201).json({
            success: true,
            data: dispute,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.openDispute = openDispute;
/**
 * Seller submits response and counter-evidence
 */
const submitSellerResponse = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const id = String(req.params.id);
        const { sellerResponse, sellerEvidenceUrl } = req.body;
        if (!sellerResponse) {
            throw new errorHandler_1.AppError('sellerResponse is required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const dispute = await db_1.default.dispute.findUnique({
            where: { id },
            include: { transaction: { include: { items: true } } },
        });
        if (!dispute) {
            throw new errorHandler_1.AppError('Dispute not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        const sellerIds = dispute.transaction.items.map((i) => i.sellerId);
        if (!sellerIds.includes(req.user.id) && !req.user.roles.includes('SUPER_ADMIN')) {
            throw new errorHandler_1.AppError('Only the merchant/seller for this order can submit a response.', 403, types_1.ErrorCode.FORBIDDEN);
        }
        const updated = await db_1.default.dispute.update({
            where: { id },
            data: {
                sellerResponse,
                sellerEvidenceUrl: sellerEvidenceUrl || null,
                status: 'UNDER_REVIEW', // Ready for admin adjudication
            },
        });
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'DISPUTE_SELLER_RESPONDED',
            entityType: 'DISPUTE',
            entityId: dispute.id,
            details: { status: 'UNDER_REVIEW' },
        });
        res.json({
            success: true,
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.submitSellerResponse = submitSellerResponse;
/**
 * Admin Adjudication: Resolve Dispute with Automated Financial Ledger Settlement
 */
const resolveDispute = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        // Role check: Only SUPER_ADMIN, OPERATIONS_ADMIN, or SUPPORT_AGENT can resolve disputes
        const adminRoles = ['SUPER_ADMIN', 'OPERATIONS_ADMIN', 'SUPPORT_AGENT'];
        const hasAdmin = req.user.roles.some((r) => adminRoles.includes(r));
        if (!hasAdmin) {
            throw new errorHandler_1.AppError('Forbidden: Only administrators can arbitrate disputes.', 403, types_1.ErrorCode.FORBIDDEN);
        }
        const id = String(req.params.id);
        const { resolution, refundAmount, notes } = req.body;
        const validResolutions = ['REFUND_FULL', 'REFUND_PARTIAL', 'RELEASE_FUNDS_TO_SELLER', 'REJECTED'];
        if (!resolution || !validResolutions.includes(resolution)) {
            throw new errorHandler_1.AppError(`Valid resolution required: ${validResolutions.join(', ')}`, 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const dispute = await db_1.default.dispute.findUnique({
            where: { id },
            include: {
                transaction: {
                    include: {
                        items: true,
                        buyer: { include: { wallet: true } },
                    },
                },
            },
        });
        if (!dispute) {
            throw new errorHandler_1.AppError('Dispute not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        if (dispute.status === 'CLOSED' || dispute.status.startsWith('RESOLVED')) {
            throw new errorHandler_1.AppError(`Dispute is already in ${dispute.status} status.`, 400, types_1.ErrorCode.BAD_REQUEST);
        }
        const tx = dispute.transaction;
        const buyerId = tx.buyerId;
        let finalRefund = 0;
        let newDisputeStatus = 'CLOSED';
        if (resolution === 'REFUND_FULL') {
            finalRefund = tx.totalAmount;
            newDisputeStatus = 'RESOLVED_BUYER';
        }
        else if (resolution === 'REFUND_PARTIAL') {
            finalRefund = parseFloat(refundAmount) || 0;
            if (finalRefund <= 0 || finalRefund > tx.totalAmount) {
                throw new errorHandler_1.AppError(`Invalid partial refund amount: $${finalRefund}. Must be between 0 and $${tx.totalAmount}`, 400, types_1.ErrorCode.VALIDATION_ERROR);
            }
            newDisputeStatus = 'PARTIAL_RESOLUTION';
        }
        else if (resolution === 'RELEASE_FUNDS_TO_SELLER') {
            newDisputeStatus = 'RESOLVED_SELLER';
        }
        // Execute atomic resolution
        await db_1.default.$transaction(async (prismaTx) => {
            // 1. If buyer refund decided, credit buyer wallet and write ledger
            if (finalRefund > 0) {
                let buyerWallet = await prismaTx.wallet.findUnique({ where: { userId: buyerId } });
                if (!buyerWallet) {
                    buyerWallet = await prismaTx.wallet.create({
                        data: { userId: buyerId, balance: 0.0 },
                    });
                }
                const newBalance = parseFloat((buyerWallet.balance + finalRefund).toFixed(2));
                await prismaTx.wallet.update({
                    where: { id: buyerWallet.id },
                    data: { balance: newBalance },
                });
                await prismaTx.ledgerEntry.create({
                    data: {
                        walletId: buyerWallet.id,
                        transactionId: tx.id,
                        type: 'REFUND',
                        amount: finalRefund,
                        balanceAfter: newBalance,
                        reference: `REFUND-DISPUTE-${dispute.id}`,
                        description: `Dispute arbitration refund for Order #${tx.transactionNumber} (${resolution})`,
                    },
                });
                // Release inventory back to listing if return/damaged
                for (const item of tx.items) {
                    const l = await prismaTx.listing.findUnique({ where: { id: item.listingId } });
                    if (l) {
                        await prismaTx.listing.update({
                            where: { id: item.listingId },
                            data: { inventoryCount: l.inventoryCount + item.quantity },
                        });
                        await prismaTx.stockMovement.create({
                            data: {
                                listingId: item.listingId,
                                movementType: 'REFUND_RESTORE',
                                quantityChange: item.quantity,
                                quantityBefore: l.inventoryCount,
                                quantityAfter: l.inventoryCount + item.quantity,
                                reference: `DISPUTE-RESTORE-${dispute.id}`,
                                performedBy: req.user.id,
                                notes: `Restored inventory from resolved dispute #${dispute.id}`,
                            },
                        });
                    }
                }
            }
            // 2. If funds released to seller or partial remaining
            const sellerAmount = tx.totalAmount - finalRefund;
            if (sellerAmount > 0 && (resolution === 'RELEASE_FUNDS_TO_SELLER' || resolution === 'REFUND_PARTIAL')) {
                const sellerId = tx.items[0]?.sellerId;
                if (sellerId) {
                    let sellerWallet = await prismaTx.wallet.findUnique({ where: { userId: sellerId } });
                    if (!sellerWallet) {
                        sellerWallet = await prismaTx.wallet.create({ data: { userId: sellerId, balance: 0.0 } });
                    }
                    const sellerNet = parseFloat((sellerAmount - tx.commissionAmount).toFixed(2));
                    const newSellerBal = parseFloat((sellerWallet.balance + sellerNet).toFixed(2));
                    await prismaTx.wallet.update({
                        where: { id: sellerWallet.id },
                        data: { balance: newSellerBal },
                    });
                    await prismaTx.ledgerEntry.create({
                        data: {
                            walletId: sellerWallet.id,
                            transactionId: tx.id,
                            type: 'CREDIT',
                            amount: sellerNet,
                            balanceAfter: newSellerBal,
                            reference: `DISPUTE-SELLER-RELEASE-${dispute.id}`,
                            description: `Arbitrated payout for Order #${tx.transactionNumber} (Net after commission)`,
                        },
                    });
                }
            }
            // 3. Update Dispute record
            await prismaTx.dispute.update({
                where: { id },
                data: {
                    status: newDisputeStatus,
                    resolution,
                    refundAmount: finalRefund > 0 ? finalRefund : null,
                    resolvedById: req.user.id,
                    resolvedAt: new Date(),
                },
            });
            // 4. Update Transaction status
            await prismaTx.marketplaceTransaction.update({
                where: { id: tx.id },
                data: {
                    status: finalRefund === tx.totalAmount ? 'REFUNDED' : 'COMPLETED',
                },
            });
            // 5. Update Escrow if exists
            await prismaTx.escrowHold.updateMany({
                where: { transactionId: tx.id },
                data: {
                    status: finalRefund === tx.totalAmount ? 'REFUNDED' : 'RELEASED',
                    releasedAt: new Date(),
                },
            });
        });
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'DISPUTE_RESOLVED',
            entityType: 'DISPUTE',
            entityId: dispute.id,
            details: { resolution, finalRefund, notes },
        });
        res.json({
            success: true,
            data: {
                disputeId: dispute.id,
                resolution,
                refundAmount: finalRefund,
                status: newDisputeStatus,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resolveDispute = resolveDispute;
/**
 * List Disputes (Admin views all, Users view their own)
 */
const getDisputes = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { status } = req.query;
        const isAdmin = req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('OPERATIONS_ADMIN');
        const where = {};
        if (status)
            where.status = String(status);
        if (!isAdmin) {
            where.OR = [
                { raisedById: req.user.id },
                { transaction: { items: { some: { sellerId: req.user.id } } } },
            ];
        }
        const disputes = await db_1.default.dispute.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                raisedBy: { select: { id: true, fullName: true, phoneNumber: true } },
                transaction: {
                    select: {
                        id: true,
                        transactionNumber: true,
                        totalAmount: true,
                        currency: true,
                        status: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: disputes,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDisputes = getDisputes;
