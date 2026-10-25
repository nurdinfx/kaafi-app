"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitVerification = exports.openDispute = exports.createReview = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const audit_1 = require("../../middleware/audit");
// Create Review (Anti-fraud: duplicate check - Test 16)
const createReview = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { listingId, transactionId, rating, comment } = req.body;
        if (!listingId || !rating || rating < 1 || rating > 5) {
            throw new errorHandler_1.AppError('Valid listingId and rating (1-5) are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        // Check for duplicate review from same user on this listing or transaction
        const existingReview = await db_1.default.review.findFirst({
            where: {
                listingId,
                reviewerId: req.user.id,
                ...(transactionId ? { transactionId } : {}),
            },
        });
        if (existingReview) {
            throw new errorHandler_1.AppError('You have already submitted a review for this item.', 409, types_1.ErrorCode.CONFLICT);
        }
        const review = await db_1.default.review.create({
            data: {
                listingId,
                transactionId: transactionId || null,
                reviewerId: req.user.id,
                rating: parseInt(rating, 10),
                comment: comment || '',
            },
        });
        // Update listing seller's rating aggregate
        const listing = await db_1.default.listing.findUnique({ where: { id: listingId } });
        if (listing?.sellerId) {
            const allReviews = await db_1.default.review.findMany({
                where: { listing: { sellerId: listing.sellerId } },
            });
            const avg = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
            await db_1.default.sellerProfile.updateMany({
                where: { userId: listing.sellerId },
                data: {
                    rating: parseFloat(avg.toFixed(1)),
                    totalReviews: allReviews.length,
                },
            });
        }
        res.status(201).json({
            success: true,
            data: review,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createReview = createReview;
// Open a Dispute on an Order
const openDispute = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { transactionId, reason, details, evidenceUrl } = req.body;
        if (!transactionId || !reason || !details) {
            throw new errorHandler_1.AppError('transactionId, reason, and details are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const tx = await db_1.default.marketplaceTransaction.findUnique({ where: { id: transactionId } });
        if (!tx) {
            throw new errorHandler_1.AppError('Transaction not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        if (tx.buyerId !== req.user.id && !req.user.roles.includes('SUPER_ADMIN')) {
            throw new errorHandler_1.AppError('Only the buyer or admin can open a dispute.', 403, types_1.ErrorCode.FORBIDDEN);
        }
        const dispute = await db_1.default.dispute.create({
            data: {
                transactionId,
                raisedById: req.user.id,
                reason,
                details,
                evidenceUrl: evidenceUrl || null,
                status: 'OPEN',
            },
        });
        await db_1.default.marketplaceTransaction.update({
            where: { id: transactionId },
            data: { status: 'DISPUTED' },
        });
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'DISPUTE_OPENED',
            entityType: 'DISPUTE',
            entityId: dispute.id,
            details: { reason, transactionId },
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
// Submit Identity or Business Document for Verification
const submitVerification = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { targetType, targetId, documentType, documentUrl } = req.body;
        if (!targetType || !documentType || !documentUrl) {
            throw new errorHandler_1.AppError('targetType, documentType, and documentUrl are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const verification = await db_1.default.verificationRequest.create({
            data: {
                userId: req.user.id,
                targetType,
                targetId: targetId || null,
                documentType,
                documentUrl,
                status: 'PENDING',
            },
        });
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'VERIFICATION_SUBMITTED',
            entityType: 'VERIFICATION',
            entityId: verification.id,
            details: { targetType, documentType },
        });
        res.status(201).json({
            success: true,
            data: verification,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.submitVerification = submitVerification;
