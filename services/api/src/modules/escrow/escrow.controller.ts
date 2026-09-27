import { Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// ----------------------------------------------------
// ESCROW & PROTECTED TRANSACTIONS (High-Value Vertical)
// ----------------------------------------------------

/**
 * Initialize an Escrow Hold for a High-Value Transaction (Vehicles, Real Estate, Wholesale)
 */
export const createEscrowHold = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { transactionId, inspectionDays = 3 } = req.body;

    if (!transactionId) {
      throw new AppError('transactionId is required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const tx = await prisma.marketplaceTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!tx) {
      throw new AppError('Transaction not found.', 404, ErrorCode.NOT_FOUND);
    }

    const existingEscrow = await prisma.escrowHold.findUnique({
      where: { transactionId },
    });

    if (existingEscrow) {
      res.json({ success: true, data: existingEscrow });
      return;
    }

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + parseInt(inspectionDays, 10));

    const escrow = await prisma.escrowHold.create({
      data: {
        transactionId,
        amount: tx.totalAmount,
        currency: tx.currency,
        status: 'HELD',
        inspectionDays: parseInt(inspectionDays, 10),
        inspectionDeadline: deadline,
      },
    });

    await logAuditEvent({
      userId: req.user.id,
      action: 'ESCROW_HOLD_CREATED',
      entityType: 'ESCROW',
      entityId: escrow.id,
      details: { transactionNumber: tx.transactionNumber, amount: tx.totalAmount, deadline },
    });

    res.status(201).json({
      success: true,
      data: escrow,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Buyer or Admin Releases Escrow Funds to Seller (Inspection passed)
 */
export const releaseEscrowHold = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const transactionId = String(req.params.transactionId);

    const escrow = await prisma.escrowHold.findUnique({
      where: { transactionId },
      include: {
        transaction: {
          include: {
            items: true,
            buyer: true,
          },
        },
      },
    });

    if (!escrow) {
      throw new AppError('Escrow hold not found.', 404, ErrorCode.NOT_FOUND);
    }

    if (escrow.status !== 'HELD') {
      throw new AppError(`Escrow is not in HELD state. Current: ${escrow.status}`, 400, ErrorCode.BAD_REQUEST);
    }

    const tx = escrow.transaction;
    const isBuyer = tx.buyerId === req.user.id;
    const isAdmin = req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('FINANCE_ADMIN');

    if (!isBuyer && !isAdmin) {
      throw new AppError('Only the buyer or an authorized finance administrator can release escrow funds.', 403, ErrorCode.FORBIDDEN);
    }

    const sellerId = tx.items[0]?.sellerId;
    if (!sellerId) {
      throw new AppError('Seller not identified for this transaction.', 400, ErrorCode.BAD_REQUEST);
    }

    // Atomic release: Credit seller wallet net of commission, update EscrowHold, update Transaction
    await prisma.$transaction(async (prismaTx) => {
      let sellerWallet = await prismaTx.wallet.findUnique({ where: { userId: sellerId } });
      if (!sellerWallet) {
        sellerWallet = await prismaTx.wallet.create({ data: { userId: sellerId, balance: 0.0 } });
      }

      const sellerNet = parseFloat((tx.totalAmount - tx.commissionAmount).toFixed(2));
      const newSellerBal = parseFloat((sellerWallet.balance + sellerNet).toFixed(2));

      await prismaTx.wallet.update({
        where: { id: sellerWallet.id },
        data: { balance: newSellerBal },
      });

      await prismaTx.ledgerEntry.create({
        data: {
          walletId: sellerWallet.id,
          transactionId: tx.id,
          type: 'CREDIT',
          amount: sellerNet,
          balanceAfter: newSellerBal,
          reference: `ESCROW-RELEASE-${tx.transactionNumber}`,
          description: `Escrow release for Order #${tx.transactionNumber} (Net after $${tx.commissionAmount} commission)`,
        },
      });

      // Update EscrowHold
      await prismaTx.escrowHold.update({
        where: { transactionId },
        data: {
          status: 'RELEASED',
          releasedAt: new Date(),
        },
      });

      // Update Transaction
      await prismaTx.marketplaceTransaction.update({
        where: { id: tx.id },
        data: { status: 'COMPLETED' },
      });
    });

    await logAuditEvent({
      userId: req.user.id,
      action: 'ESCROW_RELEASED',
      entityType: 'ESCROW',
      entityId: escrow.id,
      details: { transactionNumber: tx.transactionNumber, netPayout: tx.totalAmount - tx.commissionAmount },
    });

    res.json({
      success: true,
      data: {
        transactionId,
        status: 'RELEASED',
        releasedAt: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Escrow Details for a Transaction
 */
export const getEscrowDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const transactionId = String(req.params.transactionId);

    const escrow = await prisma.escrowHold.findUnique({
      where: { transactionId },
      include: {
        transaction: {
          select: {
            id: true,
            transactionNumber: true,
            totalAmount: true,
            currency: true,
            buyerId: true,
            items: { select: { sellerId: true, listing: { select: { title: true } } } },
          },
        },
      },
    });

    if (!escrow) {
      throw new AppError('Escrow hold not found.', 404, ErrorCode.NOT_FOUND);
    }

    res.json({
      success: true,
      data: escrow,
    });
  } catch (error) {
    next(error);
  }
};
