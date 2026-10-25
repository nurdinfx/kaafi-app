"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.acceptQuote = exports.submitQuote = exports.createWholesaleRFQ = exports.getWholesaleRFQs = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const audit_1 = require("../../middleware/audit");
// List Wholesale RFQs
const getWholesaleRFQs = async (req, res, next) => {
    try {
        const { status = 'OPEN', city } = req.query;
        const where = {};
        if (status)
            where.status = String(status);
        if (city)
            where.deliveryCity = { contains: String(city) };
        const rfqs = await db_1.default.wholesaleRFQ.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                buyer: { select: { id: true, fullName: true, phoneNumber: true } },
                _count: { select: { quotes: true } },
            },
        });
        res.json({
            success: true,
            data: rfqs,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getWholesaleRFQs = getWholesaleRFQs;
// Create B2B Wholesale RFQ
const createWholesaleRFQ = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { title, description, requiredQty, unitOfMeasure, targetPrice, currency = 'USD', deliveryCity = 'Garoowe', deadline } = req.body;
        if (!title || !requiredQty || !unitOfMeasure) {
            throw new errorHandler_1.AppError('Title, required quantity, and unit of measure are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const rfq = await db_1.default.wholesaleRFQ.create({
            data: {
                buyerId: req.user.id,
                title,
                description: description || '',
                requiredQty: parseInt(requiredQty, 10),
                unitOfMeasure,
                targetPrice: targetPrice ? parseFloat(targetPrice) : null,
                currency,
                deliveryCity,
                deadline: deadline ? new Date(deadline) : null,
                status: 'OPEN',
            },
        });
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'B2B_RFQ_CREATED',
            entityType: 'WHOLESALE_RFQ',
            entityId: rfq.id,
            details: { title, requiredQty, unitOfMeasure },
        });
        res.status(201).json({
            success: true,
            data: rfq,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createWholesaleRFQ = createWholesaleRFQ;
// Supplier: Submit Quote on RFQ
const submitQuote = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const rfqId = String(req.params.rfqId);
        const { unitPrice, currency = 'USD', moq = 1, deliveryDays = 3, notes } = req.body;
        if (!unitPrice || unitPrice <= 0) {
            throw new errorHandler_1.AppError('Valid unit price is required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const rfq = await db_1.default.wholesaleRFQ.findUnique({ where: { id: rfqId } });
        if (!rfq) {
            throw new errorHandler_1.AppError('RFQ not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        const quote = await db_1.default.wholesaleQuote.create({
            data: {
                rfqId,
                supplierId: req.user.id,
                unitPrice: parseFloat(unitPrice),
                currency,
                moq: parseInt(moq, 10) || 1,
                deliveryDays: parseInt(deliveryDays, 10) || 3,
                notes: notes || null,
                status: 'SUBMITTED',
            },
        });
        await db_1.default.wholesaleRFQ.update({
            where: { id: rfqId },
            data: { status: 'RESPONSES_RECEIVED' },
        });
        await db_1.default.notification.create({
            data: {
                userId: rfq.buyerId,
                type: 'OFFER',
                title: 'New B2B Wholesale Quote Received',
                message: `A supplier quoted $${unitPrice}/${rfq.unitOfMeasure} for "${rfq.title}"`,
                linkUrl: `/wholesale/rfq/${rfq.id}`,
            },
        });
        res.status(201).json({
            success: true,
            data: quote,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.submitQuote = submitQuote;
// Buyer: Accept Quote and Create Wholesale Transaction
const acceptQuote = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const quoteId = String(req.params.quoteId);
        const quote = await db_1.default.wholesaleQuote.findUnique({
            where: { id: quoteId },
            include: { rfq: true },
        });
        if (!quote) {
            throw new errorHandler_1.AppError('Quote not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        if (quote.rfq.buyerId !== req.user.id) {
            throw new errorHandler_1.AppError('Only the RFQ creator can accept quotes.', 403, types_1.ErrorCode.FORBIDDEN);
        }
        await db_1.default.wholesaleQuote.update({
            where: { id: quoteId },
            data: { status: 'ACCEPTED' },
        });
        await db_1.default.wholesaleRFQ.update({
            where: { id: quote.rfqId },
            data: { status: 'AWARDED' },
        });
        const subtotal = quote.unitPrice * quote.rfq.requiredQty;
        const commissionRate = 3.0; // preferential wholesale commission
        const commissionAmount = parseFloat(((subtotal * commissionRate) / 100).toFixed(2));
        const txNumber = `B2B-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const transaction = await db_1.default.marketplaceTransaction.create({
            data: {
                transactionNumber: txNumber,
                buyerId: req.user.id,
                transactionType: 'WHOLESALE',
                subtotalAmount: subtotal,
                commissionAmount,
                commissionRateUsed: commissionRate,
                totalAmount: subtotal,
                currency: quote.currency,
                deliveryCity: quote.rfq.deliveryCity,
                status: 'PENDING_PAYMENT',
                statusHistory: {
                    create: {
                        fromStatus: 'DRAFT',
                        toStatus: 'PENDING_PAYMENT',
                        notes: `Wholesale contract awarded from RFQ: ${quote.rfq.title}`,
                        changedBy: req.user.id,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: {
                quote,
                transaction,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.acceptQuote = acceptQuote;
