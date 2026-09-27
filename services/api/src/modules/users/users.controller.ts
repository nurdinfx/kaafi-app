import { Request, Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// Get Current Authenticated User Profile
export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const user = await prisma.user.findUnique({
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
      throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
    }

    const { passwordHash, ...userProfile } = user;

    res.json({
      success: true,
      data: {
        ...userProfile,
        roles: user.roles.map((r) => r.role.name),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Update Current User Profile
export const updateMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { fullName, bio, avatarUrl, city, country } = req.body;

    const updatedUser = await prisma.user.update({
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

    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};

// Get Public User Profile by ID
export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);

    const user = await prisma.user.findUnique({
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
      throw new AppError('User not found', 404, ErrorCode.NOT_FOUND);
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// Get Public Listings for a specific User
export const getUserListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [total, listings] = await Promise.all([
      prisma.listing.count({
        where: {
          sellerId: id,
          status: 'ACTIVE',
        },
      }),
      prisma.listing.findMany({
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
  } catch (error) {
    next(error);
  }
};

// Get notifications for current user
export const getMyNotifications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Mark single notification as read
export const markNotificationRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const id = String(req.params.id);

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== req.user.id) {
      throw new AppError('Notification not found', 404, ErrorCode.NOT_FOUND);
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read for current user
export const markAllNotificationsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
