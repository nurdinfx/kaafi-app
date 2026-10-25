"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestDetails = exports.createBuyerRequest = exports.getBuyerRequests = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const audit_1 = require("../../middleware/audit");
// List public buyer requests
const getBuyerRequests = async (req, res, next) => {
    try {
        const { categoryId, city, status = 'OPEN' } = req.query;
        const where = {};
        if (status)
            where.status = String(status);
        if (categoryId)
            where.categoryId = String(categoryId);
        if (city)
            where.city = { contains: String(city) };
        const requests = await db_1.default.buyerRequest.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                category: { select: { id: true, name: true, slug: true, verticalType: true } },
                buyer: { select: { id: true, fullName: true, city: true, avatarUrl: true } },
                _count: { select: { offers: true } },
            },
        });
        res.json({
            success: true,
            data: requests,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBuyerRequests = getBuyerRequests;
// Create a Buyer Request ("Request What You Need")
const createBuyerRequest = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { categoryId, title, description, targetBudget, currency = 'USD', quantity = 1, city = 'Garoowe', landmark, urgency = 'NORMAL' } = req.body;
        if (!categoryId || !title || !description) {
            throw new errorHandler_1.AppError('Category, title, and description are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const request = await db_1.default.buyerRequest.create({
            data: {
                buyerId: req.user.id,
                categoryId,
                title,
                description,
                targetBudget: targetBudget ? parseFloat(targetBudget) : null,
                currency,
                quantity: parseInt(quantity, 10) || 1,
                city,
                landmark: landmark || null,
                urgency,
            },
            include: {
                category: true,
            },
        });
        // Notify matching sellers in this category/city
        const matchingSellers = await db_1.default.listing.findMany({
            where: {
                categoryId,
                city: { contains: city },
                status: 'ACTIVE',
            },
            select: { sellerId: true },
            distinct: ['sellerId'],
            take: 10,
        });
        for (const s of matchingSellers) {
            if (s.sellerId !== req.user.id) {
                await db_1.default.notification.create({
                    data: {
                        userId: s.sellerId,
                        type: 'OFFER',
                        title: 'New Customer Request in Your Category',
                        message: `A buyer in ${city} is looking for: "${title}". Submit an offer now!`,
                        linkUrl: `/requests/${request.id}`,
                    },
                });
            }
        }
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'BUYER_REQUEST_CREATED',
            entityType: 'BUYER_REQUEST',
            entityId: request.id,
            details: { title, targetBudget, city },
        });
        res.status(201).json({
            success: true,
            data: request,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createBuyerRequest = createBuyerRequest;
// Get single request details with received offers (only buyer sees all offers)
const getRequestDetails = async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const request = await db_1.default.buyerRequest.findUnique({
            where: { id },
            include: {
                category: true,
                buyer: { select: { id: true, fullName: true, phoneNumber: true } },
                offers: {
                    include: {
                        seller: { select: { id: true, fullName: true, phoneNumber: true, avatarUrl: true } },
                        listing: { select: { id: true, title: true, price: true, slug: true } },
                        history: { orderBy: { createdAt: 'asc' } },
                    },
                },
            },
        });
        if (!request) {
            throw new errorHandler_1.AppError('Request not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        res.json({
            success: true,
            data: request,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRequestDetails = getRequestDetails;
