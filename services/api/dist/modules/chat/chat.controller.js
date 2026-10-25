"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getMessages = exports.getOrCreateConversation = exports.getConversations = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
/**
 * Get all active chat conversations for the current user
 */
const getConversations = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const participations = await db_1.default.chatParticipant.findMany({
            where: { userId: req.user.id },
            include: {
                conversation: {
                    include: {
                        participants: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        fullName: true,
                                        avatarUrl: true,
                                        city: true,
                                        verificationStatus: true,
                                        businessProfile: {
                                            select: {
                                                businessName: true,
                                                logoUrl: true,
                                                isVerified: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                        },
                    },
                },
            },
            orderBy: { conversation: { updatedAt: 'desc' } },
        });
        const conversations = await Promise.all(participations.map(async (p) => {
            const conv = p.conversation;
            const otherParticipant = conv.participants.find((part) => part.userId !== req.user?.id);
            const lastMessage = conv.messages[0] || null;
            let listing = null;
            if (conv.listingId) {
                listing = await db_1.default.listing.findUnique({
                    where: { id: conv.listingId },
                    select: {
                        id: true,
                        slug: true,
                        title: true,
                        price: true,
                        currency: true,
                        media: { take: 1, select: { url: true } },
                    },
                });
            }
            return {
                id: conv.id,
                listingId: conv.listingId,
                listing,
                otherParticipant: otherParticipant?.user || null,
                lastMessage,
                updatedAt: conv.updatedAt,
            };
        }));
        res.json({
            success: true,
            data: conversations,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getConversations = getConversations;
/**
 * Get or create a conversation between current user and a recipient
 */
const getOrCreateConversation = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { recipientId, listingId } = req.body;
        if (!recipientId) {
            throw new errorHandler_1.AppError('recipientId is required', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        if (recipientId === req.user.id) {
            throw new errorHandler_1.AppError('You cannot start a conversation with yourself', 400, types_1.ErrorCode.BAD_REQUEST);
        }
        // Check if recipient exists
        const recipient = await db_1.default.user.findUnique({
            where: { id: recipientId },
            select: { id: true, fullName: true, avatarUrl: true },
        });
        if (!recipient) {
            throw new errorHandler_1.AppError('Recipient not found', 404, types_1.ErrorCode.NOT_FOUND);
        }
        // Find existing conversation with both participants
        const userConvs = await db_1.default.chatParticipant.findMany({
            where: { userId: req.user.id },
            select: { conversationId: true },
        });
        const convIds = userConvs.map((c) => c.conversationId);
        let existing = null;
        if (convIds.length > 0) {
            const match = await db_1.default.chatParticipant.findFirst({
                where: {
                    conversationId: { in: convIds },
                    userId: recipientId,
                },
                include: {
                    conversation: true,
                },
            });
            if (match) {
                existing = match.conversation;
            }
        }
        if (existing) {
            // If listingId provided and not set, update it
            if (listingId && !existing.listingId) {
                existing = await db_1.default.chatConversation.update({
                    where: { id: existing.id },
                    data: { listingId },
                });
            }
            res.json({
                success: true,
                data: existing,
            });
            return;
        }
        // Create new conversation
        const newConv = await db_1.default.chatConversation.create({
            data: {
                listingId: listingId || null,
                participants: {
                    create: [
                        { userId: req.user.id },
                        { userId: recipientId },
                    ],
                },
            },
        });
        res.status(201).json({
            success: true,
            data: newConv,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrCreateConversation = getOrCreateConversation;
/**
 * Get messages for a specific conversation
 */
const getMessages = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { id } = req.params;
        // Verify user is a participant
        const isParticipant = await db_1.default.chatParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId: String(id),
                    userId: req.user.id,
                },
            },
        });
        if (!isParticipant) {
            throw new errorHandler_1.AppError('You are not a participant in this conversation', 403, types_1.ErrorCode.FORBIDDEN);
        }
        const messages = await db_1.default.chatMessage.findMany({
            where: { conversationId: String(id) },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
            take: 100,
        });
        // Mark unread messages as read
        await db_1.default.chatMessage.updateMany({
            where: {
                conversationId: String(id),
                senderId: { not: req.user.id },
                isRead: false,
            },
            data: { isRead: true },
        });
        res.json({
            success: true,
            data: messages,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMessages = getMessages;
/**
 * Send a message with text, photo, video, or offer
 */
const sendMessage = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { id } = req.params;
        const { content, attachmentUrl, offerAttachment } = req.body;
        if (!content && !attachmentUrl && !offerAttachment) {
            throw new errorHandler_1.AppError('Message content or attachment is required', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        // Verify participant
        const isParticipant = await db_1.default.chatParticipant.findUnique({
            where: {
                conversationId_userId: {
                    conversationId: String(id),
                    userId: req.user.id,
                },
            },
        });
        if (!isParticipant) {
            throw new errorHandler_1.AppError('You are not a participant in this conversation', 403, types_1.ErrorCode.FORBIDDEN);
        }
        const message = await db_1.default.chatMessage.create({
            data: {
                conversationId: String(id),
                senderId: req.user.id,
                content: content || (attachmentUrl ? '📎 Media Attachment' : 'Structured Offer'),
                attachmentUrl: attachmentUrl || null,
                offerAttachment: offerAttachment ? JSON.stringify(offerAttachment) : null,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        fullName: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        // Touch conversation updatedAt
        await db_1.default.chatConversation.update({
            where: { id: String(id) },
            data: { updatedAt: new Date() },
        });
        // Notify other participant
        const otherParticipant = await db_1.default.chatParticipant.findFirst({
            where: {
                conversationId: String(id),
                userId: { not: req.user.id },
            },
        });
        if (otherParticipant) {
            await db_1.default.notification.create({
                data: {
                    userId: otherParticipant.userId,
                    type: 'MESSAGE',
                    title: `Farriin cusub ka timid ${req.user.fullName || 'User'}`,
                    message: content ? (content.length > 50 ? content.slice(0, 50) + '...' : content) : '📎 Waxaa laguu soo diray sawir/muuqaal cusub',
                    linkUrl: `/chat?convId=${id}`,
                },
            });
        }
        res.status(201).json({
            success: true,
            data: message,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendMessage = sendMessage;
