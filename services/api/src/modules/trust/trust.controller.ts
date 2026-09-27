import { Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// Create Review (Anti-fraud: duplicate check - Test 16)
export const createReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { listingId, transactionId, rating, comment } = req.body;

    if (!listingId || !rating || rating < 1 || rating > 5) {
      throw new AppError('Valid listingId and rating (1-5) are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    // Check for duplicate review from same user on this listing or transaction
    const existingReview = await prisma.review.findFirst({
      where: {
        listingId,
        reviewerId: req.user.id,
        ...(transactionId ? { transactionId } : {}),
      },
    });

    if (existingReview) {
      throw new AppError('You have already submitted a review for this item.', 409, ErrorCode.CONFLICT);
    }

    const review = await prisma.review.create({
      data: {
        listingId,
        transactionId: transactionId || null,
        reviewerId: req.user.id,
        rating: parseInt(rating, 10),
        comment: comment || '',
      },
    });

    // Update listing seller's rating aggregate
    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (listing?.sellerId) {
      const allReviews = await prisma.review.findMany({
        where: { listing: { sellerId: listing.sellerId } },
      });
      const avg = allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
      await prisma.sellerProfile.updateMany({
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
  } catch (error) {
    next(error);
  }
};

// Open a Dispute on an Order
export const openDispute = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { transactionId, reason, details, evidenceUrl } = req.body;

    if (!transactionId || !reason || !details) {
      throw new AppError('transactionId, reason, and details are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const tx = await prisma.marketplaceTransaction.findUnique({ where: { id: transactionId } });
    if (!tx) {
      throw new AppError('Transaction not found.', 404, ErrorCode.NOT_FOUND);
    }

    if (tx.buyerId !== req.user.id && !req.user.roles.includes('SUPER_ADMIN')) {
      throw new AppError('Only the buyer or admin can open a dispute.', 403, ErrorCode.FORBIDDEN);
    }

    const dispute = await prisma.dispute.create({
      data: {
        transactionId,
        raisedById: req.user.id,
        reason,
        details,
        evidenceUrl: evidenceUrl || null,
        status: 'OPEN',
      },
    });

    await prisma.marketplaceTransaction.update({
      where: { id: transactionId },
      data: { status: 'DISPUTED' },
    });

    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};

// Submit Identity or Business Document for Verification
export const submitVerification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { targetType, targetId, documentType, documentUrl } = req.body;

    if (!targetType || !documentType || !documentUrl) {
      throw new AppError('targetType, documentType, and documentUrl are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const verification = await prisma.verificationRequest.create({
      data: {
        userId: req.user.id,
        targetType,
        targetId: targetId || null,
        documentType,
        documentUrl,
        status: 'PENDING',
      },
    });

    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};
