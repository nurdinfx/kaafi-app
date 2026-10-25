"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllNotificationsRead = exports.markNotificationRead = exports.getMyNotifications = exports.getUserListings = exports.getUserById = exports.updateMe = exports.getMe = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const audit_1 = require("../../middleware/audit");
// Get Current Authenticated User Profile
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const user = await db_1.default.user.findUnique({
            where: { id: req.user.id },
            include: {
                roles: { include: { role: true } },
                sellerProfile: true,
                businessProfile: {
                    include: {
                        branches: true,
                    },
                },
                driverProfile: true,
                wallet: {
                    select: {
                        balance: true,
                        pendingBalance: true,
                        currency: true,
                    },
                },
                _count: {
                    select: {
                        listings: true,
                        buyerRequests: true,
                        followers: true,
                        following: true,
                    },
                },
            },
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404, types_1.ErrorCode.NOT_FOUND);
        }
        const { passwordHash, ...userProfile } = user;
        res.json({
            success: true,
            data: {
                ...userProfile,
                roles: user.roles.map((r) => r.role.name),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
// Update Current User Profile
const updateMe = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { fullName, bio, avatarUrl, city, country } = req.body;
        const updatedUser = await db_1.default.user.update({
            where: { id: req.user.id },
            data: {
                fullName: fullName || undefined,
                bio: bio !== undefined ? bio : undefined,
                avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
                city: city || undefined,
                country: country || undefined,
            },
            select: {
                id: true,
                phoneNumber: true,
                email: true,
                fullName: true,
                avatarUrl: true,
                bio: true,
                city: true,
                country: true,
                verificationStatus: true,
                updatedAt: true,
            },
        });
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'USER_PROFILE_UPDATED',
            entityType: 'USER',
            entityId: req.user.id,
            details: { updatedFields: Object.keys(req.body) },
        });
        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateMe = updateMe;
// Get Public User Profile by ID
const getUserById = async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const user = await db_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                bio: true,
                city: true,
                country: true,
                verificationStatus: true,
                createdAt: true,
                sellerProfile: {
                    select: {
                        rating: true,
                        totalReviews: true,
                        completedSales: true,
                        isVerified: true,
                    },
                },
                businessProfile: {
                    select: {
                        id: true,
                        businessName: true,
                        slug: true,
                        logoUrl: true,
                        coverImageUrl: true,
                        isVerified: true,
                        rating: true,
                        totalReviews: true,
                    },
                },
                _count: {
                    select: {
                        listings: true,
                        followers: true,
                        following: true,
                    },
                },
            },
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found', 404, types_1.ErrorCode.NOT_FOUND);
        }
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserById = getUserById;
// Get Public Listings for a specific User
const getUserListings = async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const { page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(String(page), 10) || 1;
        const limitNum = parseInt(String(limit), 10) || 20;
        const skip = (pageNum - 1) * limitNum;
        const [total, listings] = await Promise.all([
            db_1.default.listing.count({
                where: {
                    sellerId: id,
                    status: 'ACTIVE',
                },
            }),
            db_1.default.listing.findMany({
                where: {
                    sellerId: id,
                    status: 'ACTIVE',
                },
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    media: { orderBy: { sortOrder: 'asc' }, take: 1 },
                    category: { select: { id: true, name: true, slug: true, verticalType: true } },
                    vehicleDetails: true,
                    propertyDetails: true,
                },
            }),
        ]);
        res.json({
            success: true,
            data: listings,
            meta: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserListings = getUserListings;
// Get notifications for current user
const getMyNotifications = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const notifications = await db_1.default.notification.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        res.json({
            success: true,
            data: notifications,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyNotifications = getMyNotifications;
// Mark single notification as read
const markNotificationRead = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const id = String(req.params.id);
        const notification = await db_1.default.notification.findUnique({
            where: { id },
        });
        if (!notification || notification.userId !== req.user.id) {
            throw new errorHandler_1.AppError('Notification not found', 404, types_1.ErrorCode.NOT_FOUND);
        }
        const updated = await db_1.default.notification.update({
            where: { id },
            data: { isRead: true },
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
exports.markNotificationRead = markNotificationRead;
// Mark all notifications as read for current user
const markAllNotificationsRead = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        await db_1.default.notification.updateMany({
            where: { userId: req.user.id, isRead: false },
            data: { isRead: true },
        });
        res.json({
            success: true,
            message: 'All notifications marked as read',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markAllNotificationsRead = markAllNotificationsRead;
