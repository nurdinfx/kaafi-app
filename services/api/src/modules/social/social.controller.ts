import { Request, Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// Get Social Feed (Following or For You discovery)
export const getFeed = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { feedType = 'FOR_YOU', page = '1', limit = '15' } = req.query;
    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 15;
    const skip = (pageNum - 1) * limitNum;

    let where: any = {};

    if (feedType === 'FOLLOWING' && req.user) {
      const following = await prisma.userFollow.findMany({
        where: { followerId: req.user.id },
        select: { targetUserId: true },
      });
      const targetIds = following.map((f) => f.targetUserId);
      where.authorId = { in: targetIds };
    }

    const posts = await prisma.socialPost.findMany({
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
  } catch (error) {
    next(error);
  }
};

// Create Social Post with Attached Marketplace Listings (Social Discovery -> Commerce)
export const createPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { caption, mediaUrl, mediaType = 'IMAGE', linkedListingIds = [] } = req.body;

    if (!mediaUrl) {
      throw new AppError('mediaUrl is required for social posts.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const post = await prisma.socialPost.create({
      data: {
        authorId: req.user.id,
        caption: caption || '',
        mediaUrl,
        mediaType,
        linkedListings: {
          create: (linkedListingIds as string[]).map((listingId) => ({
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

    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};

// Follow or Unfollow a User / Creator / Business
export const toggleFollow = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const targetUserId = String(req.params.targetUserId);

    if (targetUserId === req.user.id) {
      throw new AppError('You cannot follow yourself.', 400, ErrorCode.BAD_REQUEST);
    }

    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_targetUserId: {
          followerId: req.user.id,
          targetUserId,
        },
      },
    });

    if (existingFollow) {
      await prisma.userFollow.delete({
        where: { id: existingFollow.id },
      });
      res.json({ success: true, data: { following: false } });
    } else {
      await prisma.userFollow.create({
        data: {
          followerId: req.user.id,
          targetUserId,
        },
      });

      await prisma.notification.create({
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
  } catch (error) {
    next(error);
  }
};

// Like or Unlike a Post
export const toggleLike = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const postId = String(req.params.postId);

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: req.user.id,
        },
      },
    });

    if (existingLike) {
      await prisma.postLike.delete({ where: { id: existingLike.id } });
      await prisma.socialPost.update({ where: { id: postId }, data: { likesCount: { decrement: 1 } } });
      res.json({ success: true, data: { liked: false } });
    } else {
      await prisma.postLike.create({
        data: {
          postId,
          userId: req.user.id,
        },
      });
      await prisma.socialPost.update({ where: { id: postId }, data: { likesCount: { increment: 1 } } });
      res.json({ success: true, data: { liked: true } });
    }
  } catch (error) {
    next(error);
  }
};
