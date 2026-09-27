import { Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// Driver: Update Online Status & GPS Location
export const updateDriverLocation = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { isOnline, latitude, longitude } = req.body;

    const driver = await prisma.driverProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!driver) {
      throw new AppError('Driver profile not found.', 404, ErrorCode.NOT_FOUND);
    }

    const updated = await prisma.driverProfile.update({
      where: { id: driver.id },
      data: {
        isOnline: isOnline !== undefined ? !!isOnline : driver.isOnline,
        currentLat: latitude !== undefined ? parseFloat(latitude) : driver.currentLat,
        currentLng: longitude !== undefined ? parseFloat(longitude) : driver.currentLng,
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Driver: Get Available Delivery Jobs
export const getAvailableJobs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const jobs = await prisma.deliveryJob.findMany({
      where: {
        status: 'SEARCHING_DRIVER',
      },
      include: {
        transaction: {
          select: {
            id: true,
            transactionNumber: true,
            recipientPhone: true,
            totalAmount: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// Driver: Accept a Delivery Job
export const acceptDeliveryJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const jobId = String(req.params.jobId);

    const driver = await prisma.driverProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!driver) {
      throw new AppError('Driver profile required to accept deliveries.', 403, ErrorCode.FORBIDDEN);
    }

    const job = await prisma.deliveryJob.findUnique({ where: { id: jobId } });
    if (!job || job.status !== 'SEARCHING_DRIVER') {
      throw new AppError('Delivery job is no longer available.', 400, ErrorCode.BAD_REQUEST);
    }

    const updatedJob = await prisma.deliveryJob.update({
      where: { id: jobId },
      data: {
        driverId: driver.id,
        status: 'ACCEPTED',
      },
    });

    await prisma.marketplaceTransaction.update({
      where: { id: job.transactionId },
      data: { status: 'ASSIGNED' },
    });

    res.json({
      success: true,
      data: updatedJob,
    });
  } catch (error) {
    next(error);
  }
};

// Driver: Complete Delivery with Proof of Delivery PIN (Section 74)
export const completeProofOfDelivery = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const jobId = String(req.params.jobId);
    const { deliveryPin, proofPhotoUrl } = req.body;

    if (!deliveryPin) {
      throw new AppError('Customer Proof of Delivery PIN is required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const job = await prisma.deliveryJob.findUnique({
      where: { id: jobId },
      include: { transaction: true },
    });

    if (!job) {
      throw new AppError('Delivery job not found.', 404, ErrorCode.NOT_FOUND);
    }

    // Verify secret PIN buyer provided
    if (job.deliveryPin !== String(deliveryPin).trim()) {
      throw new AppError('Invalid Proof of Delivery PIN. Please confirm the PIN with the customer.', 400, ErrorCode.VALIDATION_ERROR);
    }

    // Mark job delivered
    const updatedJob = await prisma.deliveryJob.update({
      where: { id: jobId },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(),
        proofPhotoUrl: proofPhotoUrl || null,
      },
    });

    // Complete transaction
    await prisma.marketplaceTransaction.update({
      where: { id: job.transactionId },
      data: { status: 'COMPLETED' },
    });

    // Credit driver wallet with delivery fee
    if (job.driverId) {
      const driver = await prisma.driverProfile.findUnique({ where: { id: job.driverId } });
      if (driver) {
        const driverWallet = await prisma.wallet.findUnique({ where: { userId: driver.userId } });
        if (driverWallet) {
          const newBalance = parseFloat((driverWallet.balance + job.fee).toFixed(2));
          await prisma.wallet.update({
            where: { id: driverWallet.id },
            data: { balance: newBalance },
          });

          await prisma.ledgerEntry.create({
            data: {
              walletId: driverWallet.id,
              transactionId: job.transactionId,
              type: 'CREDIT',
              amount: job.fee,
              balanceAfter: newBalance,
              reference: `DRV-${job.id}`,
              description: `Delivery fee earned for Order #${job.transaction.transactionNumber}`,
            },
          });
        }
      }
    }

    await logAuditEvent({
      userId: req.user.id,
      action: 'PROOF_OF_DELIVERY_VERIFIED',
      entityType: 'DELIVERY_JOB',
      entityId: job.id,
      details: { fee: job.fee, transactionId: job.transactionId },
    });

    res.json({
      success: true,
      data: {
        message: 'Proof of delivery verified. Order successfully completed.',
        job: updatedJob,
      },
    });
  } catch (error) {
    next(error);
  }
};
