import { Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';

/**
 * Get all active chat conversations for the current user
 */
export const getConversations = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const participations = await prisma.chatParticipant.findMany({
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

    const conversations = await Promise.all(
      participations.map(async (p) => {
        const conv = p.conversation;
        const otherParticipant = conv.participants.find((part) => part.userId !== req.user?.id);
        const lastMessage = conv.messages[0] || null;

        let listing = null;
        if (conv.listingId) {
          listing = await prisma.listing.findUnique({
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
      })
    );

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get or create a conversation between current user and a recipient
 */
export const getOrCreateConversation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { recipientId, listingId } = req.body;
    if (!recipientId) {
      throw new AppError('recipientId is required', 400, ErrorCode.VALIDATION_ERROR);
    }

    if (recipientId === req.user.id) {
      throw new AppError('You cannot start a conversation with yourself', 400, ErrorCode.BAD_REQUEST);
    }

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, fullName: true, avatarUrl: true },
    });
    if (!recipient) {
      throw new AppError('Recipient not found', 404, ErrorCode.NOT_FOUND);
    }

    // Find existing conversation with both participants
    const userConvs = await prisma.chatParticipant.findMany({
      where: { userId: req.user.id },
      select: { conversationId: true },
    });
    const convIds = userConvs.map((c) => c.conversationId);

    let existing = null;
    if (convIds.length > 0) {
      const match = await prisma.chatParticipant.findFirst({
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
        existing = await prisma.chatConversation.update({
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
    const newConv = await prisma.chatConversation.create({
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
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages for a specific conversation
 */
export const getMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { id } = req.params;

    // Verify user is a participant
    const isParticipant = await prisma.chatParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: String(id),
          userId: req.user.id,
        },
      },
    });

    if (!isParticipant) {
      throw new AppError('You are not a participant in this conversation', 403, ErrorCode.FORBIDDEN);
    }

    const messages = await prisma.chatMessage.findMany({
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
    await prisma.chatMessage.updateMany({
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
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message with text, photo, video, or offer
 */
export const sendMessage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { id } = req.params;
    const { content, attachmentUrl, offerAttachment } = req.body;

    if (!content && !attachmentUrl && !offerAttachment) {
      throw new AppError('Message content or attachment is required', 400, ErrorCode.VALIDATION_ERROR);
    }

    // Verify participant
    const isParticipant = await prisma.chatParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: String(id),
          userId: req.user.id,
        },
      },
    });

    if (!isParticipant) {
      throw new AppError('You are not a participant in this conversation', 403, ErrorCode.FORBIDDEN);
    }

    const message = await prisma.chatMessage.create({
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
    await prisma.chatConversation.update({
      where: { id: String(id) },
      data: { updatedAt: new Date() },
    });

    // Notify other participant
    const otherParticipant = await prisma.chatParticipant.findFirst({
      where: {
        conversationId: String(id),
        userId: { not: req.user.id },
      },
    });

    if (otherParticipant) {
      await prisma.notification.create({
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
  } catch (error) {
    next(error);
  }
};
