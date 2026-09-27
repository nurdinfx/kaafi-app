import { Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// Real Platform Analytics (GMV, Commission, Users, Active Orders) - NO MOCK DATA
export const getPlatformAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalUsers,
      totalSellers,
      totalBusinesses,
      totalListings,
      totalTransactions,
      completedTransactions,
      auditLogsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.sellerProfile.count(),
      prisma.businessProfile.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.marketplaceTransaction.count(),
      prisma.marketplaceTransaction.findMany({
        where: { status: { in: ['COMPLETED', 'PAYMENT_CONFIRMED', 'DELIVERED'] } },
        select: { totalAmount: true, commissionAmount: true },
      }),
      prisma.auditLog.count(),
    ]);

    const gmv = completedTransactions.reduce((acc, tx) => acc + tx.totalAmount, 0);
    const platformCommission = completedTransactions.reduce((acc, tx) => acc + tx.commissionAmount, 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalSellers,
        totalBusinesses,
        totalListings,
        totalTransactions,
        gmv: parseFloat(gmv.toFixed(2)),
        platformCommission: parseFloat(platformCommission.toFixed(2)),
        auditLogsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Review & Approve Verification Request
export const reviewVerification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status, rejectionReason } = req.body; // APPROVED or REJECTED

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      throw new AppError('Status must be APPROVED or REJECTED.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const verification = await prisma.verificationRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!verification) {
      throw new AppError('Verification request not found.', 404, ErrorCode.NOT_FOUND);
    }

    const updated = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason || 'Documentation insufficient' : null,
        reviewedAt: new Date(),
      },
    });

    // If approved, update target profile
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: verification.userId },
        data: { verificationStatus: 'VERIFIED' },
      });

      if (verification.targetType === 'SELLER') {
        await prisma.sellerProfile.updateMany({
          where: { userId: verification.userId },
          data: { isVerified: true },
        });
      } else if (verification.targetType === 'BUSINESS' && verification.targetId) {
        await prisma.businessProfile.update({
          where: { id: verification.targetId },
          data: { isVerified: true },
        });
      }
    }

    await logAuditEvent({
      userId: req.user?.id,
      action: `VERIFICATION_${status}`,
      entityType: 'VERIFICATION',
      entityId: verification.id,
      details: { targetUser: verification.userId, targetType: verification.targetType },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Process Payout Request
export const processPayout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payoutId = String(req.params.payoutId);
    const { status, adminNotes } = req.body; // COMPLETED or REJECTED

    if (!status || !['COMPLETED', 'FAILED'].includes(status)) {
      throw new AppError('Status must be COMPLETED or FAILED.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const payout = await prisma.payoutRequest.findUnique({
      where: { id: payoutId },
      include: { wallet: true },
    });

    if (!payout) {
      throw new AppError('Payout request not found.', 404, ErrorCode.NOT_FOUND);
    }

    if (payout.status !== 'REQUESTED') {
      throw new AppError(`Payout is already in ${payout.status} state.`, 400, ErrorCode.BAD_REQUEST);
    }

    const updatedPayout = await prisma.payoutRequest.update({
      where: { id: payoutId },
      data: {
        status,
        adminNotes: adminNotes || null,
        processedAt: new Date(),
      },
    });

    // If failed, refund amount back to wallet
    if (status === 'FAILED') {
      const newBalance = parseFloat((payout.wallet.balance + payout.amount).toFixed(2));
      await prisma.wallet.update({
        where: { id: payout.walletId },
        data: { balance: newBalance },
      });

      await prisma.ledgerEntry.create({
        data: {
          walletId: payout.walletId,
          type: 'REFUND',
          amount: payout.amount,
          balanceAfter: newBalance,
          reference: `PO-REVERT-${payout.id}`,
          description: `Payout #${payout.id} failed/rejected by admin. Balance refunded.`,
        },
      });
    }

    await logAuditEvent({
      userId: req.user?.id,
      action: `PAYOUT_${status}`,
      entityType: 'PAYOUT',
      entityId: payout.id,
      details: { amount: payout.amount, adminNotes },
    });

    res.json({
      success: true,
      data: updatedPayout,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: View Append-Only Audit Logs
export const getAuditLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '50', action, entityType } = req.query;
    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (action) where.action = String(action);
    if (entityType) where.entityType = String(entityType);

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, phoneNumber: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: logs,
      meta: { total, page: pageNum, limit: limitNum },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Query Users with Role & Status Filtering
export const getUsersAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, search, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: String(search) } },
        { phoneNumber: { contains: String(search) } },
      ];
    }
    if (role) {
      where.roles = { some: { role: { name: String(role) } } };
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          phoneNumber: true,
          fullName: true,
          city: true,
          verificationStatus: true,
          isActive: true,
          createdAt: true,
          roles: { select: { role: { select: { name: true } } } },
          wallet: { select: { balance: true } },
          _count: { select: { listings: true, buyerTransactions: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: users,
      meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Deactivate / Ban or Reactivate User
export const updateUserStatusAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { isActive, reason } = req.body;

    if (isActive === undefined) {
      throw new AppError('isActive boolean is required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !!isActive },
    });

    await logAuditEvent({
      userId: req.user?.id,
      action: isActive ? 'USER_REACTIVATED' : 'USER_SUSPENDED',
      entityType: 'USER',
      entityId: id,
      details: { isActive, reason },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Moderate Listing (Archive, Activate, Verify)
export const moderateListingAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status, verificationStatus, moderationNotes } = req.body;

    const data: any = {};
    if (status) data.status = String(status);
    if (verificationStatus) data.verificationStatus = String(verificationStatus);

    const listing = await prisma.listing.update({
      where: { id },
      data,
    });

    await logAuditEvent({
      userId: req.user?.id,
      action: 'LISTING_MODERATED',
      entityType: 'LISTING',
      entityId: id,
      details: { status, verificationStatus, moderationNotes },
    });

    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Category Commission Rate
export const updateCategoryCommissionAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { commissionRate } = req.body;

    if (commissionRate === undefined || isNaN(parseFloat(commissionRate))) {
      throw new AppError('Valid commissionRate number is required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { commissionRate: parseFloat(commissionRate) },
    });

    await logAuditEvent({
      userId: req.user?.id,
      action: 'CATEGORY_COMMISSION_UPDATED',
      entityType: 'CATEGORY',
      entityId: id,
      details: { newRate: commissionRate },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
