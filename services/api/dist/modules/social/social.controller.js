"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleLike = exports.toggleFollow = exports.createPost = exports.getFeed = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const audit_1 = require("../../middleware/audit");
// Get Social Feed (Following or For You discovery)
const getFeed = async (req, res, next) => {
    try {
        const { feedType = 'FOR_YOU', page = '1', limit = '15' } = req.query;
        const pageNum = parseInt(String(page), 10) || 1;
        const limitNum = parseInt(String(limit), 10) || 15;
        const skip = (pageNum - 1) * limitNum;
        let where = {};
        if (feedType === 'FOLLOWING' && req.user) {
            const following = await db_1.default.userFollow.findMany({
                where: { followerId: req.user.id },
                select: { targetUserId: true },
            });
            const targetIds = following.map((f) => f.targetUserId);
            where.authorId = { in: targetIds };
        }
        const posts = await db_1.default.socialPost.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                        roles: { include: { role: true } },
                        businessProfile: { select: { id: true, businessName: true, slug: true, isVerified: true } },
                    },
                },
                linkedListings: {
                    include: {
                        listing: {
                            select: {
                                id: true,
                                title: true,
                                slug: true,
                                price: true,
                                currency: true,
                                media: { take: 1 },
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: posts,
            meta: { page: pageNum, limit: limitNum },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFeed = getFeed;
// Create Social Post with Attached Marketplace Listings (Social Discovery -> Commerce)
const createPost = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { caption, mediaUrl, mediaType = 'IMAGE', linkedListingIds = [] } = req.body;
        if (!mediaUrl) {
            throw new errorHandler_1.AppError('mediaUrl is required for social posts.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const post = await db_1.default.socialPost.create({
            data: {
                authorId: req.user.id,
                caption: caption || '',
                mediaUrl,
                mediaType,
                linkedListings: {
                    create: linkedListingIds.map((listingId) => ({
                        listingId,
                    })),
                },
            },
            include: {
                linkedListings: {
                    include: {
                        listing: true,
                    },
                },
            },
        });
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'SOCIAL_POST_CREATED',
            entityType: 'SOCIAL_POST',
            entityId: post.id,
            details: { linkedCount: linkedListingIds.length },
        });
        res.status(201).json({
            success: true,
            data: post,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createPost = createPost;
// Follow or Unfollow a User / Creator / Business
const toggleFollow = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const targetUserId = String(req.params.targetUserId);
        if (targetUserId === req.user.id) {
            throw new errorHandler_1.AppError('You cannot follow yourself.', 400, types_1.ErrorCode.BAD_REQUEST);
        }
        const existingFollow = await db_1.default.userFollow.findUnique({
            where: {
                followerId_targetUserId: {
                    followerId: req.user.id,
                    targetUserId,
                },
            },
        });
        if (existingFollow) {
            await db_1.default.userFollow.delete({
                where: { id: existingFollow.id },
            });
            res.json({ success: true, data: { following: false } });
        }
        else {
            await db_1.default.userFollow.create({
                data: {
                    followerId: req.user.id,
                    targetUserId,
                },
            });
            await db_1.default.notification.create({
                data: {
                    userId: targetUserId,
                    type: 'SOCIAL',
                    title: 'New Follower',
                    message: `${req.user.fullName} started following you.`,
                    linkUrl: `/profile/${req.user.id}`,
                },
            });
            res.json({ success: true, data: { following: true } });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.toggleFollow = toggleFollow;
// Like or Unlike a Post
const toggleLike = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const postId = String(req.params.postId);
        const existingLike = await db_1.default.postLike.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId: req.user.id,
                },
            },
        });
        if (existingLike) {
            await db_1.default.postLike.delete({ where: { id: existingLike.id } });
            await db_1.default.socialPost.update({ where: { id: postId }, data: { likesCount: { decrement: 1 } } });
            res.json({ success: true, data: { liked: false } });
        }
        else {
            await db_1.default.postLike.create({
                data: {
                    postId,
                    userId: req.user.id,
                },
            });
            await db_1.default.socialPost.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } });
            res.json({ success: true, data: { liked: true } });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.toggleLike = toggleLike;
