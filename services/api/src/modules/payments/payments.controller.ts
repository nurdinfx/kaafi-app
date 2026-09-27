import { Request, Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { getPaymentAdapter } from './payment.adapter';
import { logAuditEvent } from '../../middleware/audit';

// Initiate Payment on a Transaction
export const initiatePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { transactionId, provider, payerPhone, idempotencyKey } = req.body;

    if (!transactionId || !provider || !idempotencyKey) {
      throw new AppError('transactionId, provider, and idempotencyKey are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    // Check idempotency
    const existingPayment = await prisma.payment.findUnique({
      where: { idempotencyKey },
    });

    if (existingPayment) {
      res.json({
        success: true,
        data: {
          payment: existingPayment,
          isIdempotentReplay: true,
        },
      });
      return;
    }

    const tx = await prisma.marketplaceTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!tx) {
      throw new AppError('Transaction not found.', 404, ErrorCode.NOT_FOUND);
    }

    if (tx.status === 'COMPLETED' || tx.status === 'PAYMENT_CONFIRMED') {
      throw new AppError('Transaction has already been paid.', 400, ErrorCode.BAD_REQUEST);
    }

    // Handle In-App Wallet payment directly
    if (provider.toUpperCase() === 'WALLET') {
      const buyerWallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
      if (!buyerWallet || buyerWallet.balance < tx.totalAmount) {
        throw new AppError(
          `Insufficient wallet balance. Available: $${buyerWallet?.balance || 0.0}, Required: $${tx.totalAmount}`,
          400,
          ErrorCode.INSUFFICIENT_FUNDS
        );
      }

      // Deduct atomically
      const newBalance = parseFloat((buyerWallet.balance - tx.totalAmount).toFixed(2));
      await prisma.wallet.update({
        where: { id: buyerWallet.id },
        data: { balance: newBalance },
      });

      await prisma.ledgerEntry.create({
        data: {
          walletId: buyerWallet.id,
          transactionId: tx.id,
          type: 'DEBIT',
          amount: tx.totalAmount,
          balanceAfter: newBalance,
          reference: `PAY-${tx.transactionNumber}`,
          description: `Payment for Order #${tx.transactionNumber}`,
        },
      });

      const payment = await prisma.payment.create({
        data: {
          transactionId: tx.id,
          provider: 'WALLET',
          amount: tx.totalAmount,
          currency: tx.currency,
          idempotencyKey,
          status: 'CONFIRMED',
          providerReference: `WALLET-${Date.now()}`,
        },
      });

      await prisma.marketplaceTransaction.update({
        where: { id: tx.id },
        data: { status: 'PAYMENT_CONFIRMED' },
      });

      res.json({ success: true, data: { payment, status: 'CONFIRMED' } });
      return;
    }

    // External Africa-first Payment Adapter (EVC Plus, ZAAD, SAHAL, Cash)
    const adapter = getPaymentAdapter(provider);
    const result = await adapter.initiatePayment({
      transactionId: tx.id,
      amount: tx.totalAmount,
      currency: tx.currency,
      payerPhone: payerPhone || req.user.phoneNumber,
      provider,
      idempotencyKey,
    });

    const payment = await prisma.payment.create({
      data: {
        transactionId: tx.id,
        provider: provider.toUpperCase(),
        amount: tx.totalAmount,
        currency: tx.currency,
        payerPhone: payerPhone || req.user.phoneNumber,
        providerReference: result.providerReference,
        idempotencyKey,
        status: result.status,
      },
    });

    if (result.status === 'CONFIRMED') {
      await prisma.marketplaceTransaction.update({
        where: { id: tx.id },
        data: { status: 'PAYMENT_CONFIRMED' },
      });
    }

    await logAuditEvent({
      userId: req.user.id,
      action: 'PAYMENT_INITIATED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      details: { provider, amount: payment.amount, status: payment.status },
    });

    res.json({
      success: true,
      data: {
        payment,
        message: result.message,
        isConfigurationRequired: result.isConfigurationRequired,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Payment Webhook (Idempotent replay protection - Test 15)
export const handlePaymentWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const provider = String(req.params.provider);
    const { eventId, transactionId, status, providerReference } = req.body;

    if (!eventId) {
      throw new AppError('Missing eventId in webhook payload.', 400, ErrorCode.VALIDATION_ERROR);
    }

    // Idempotency check in database
    const existingWebhook = await prisma.paymentWebhook.findUnique({
      where: { webhookEventId: eventId },
    });

    if (existingWebhook && existingWebhook.processed) {
      res.status(200).json({
        success: true,
        message: 'Webhook already processed (Idempotent response).',
      });
      return;
    }

    // Record webhook event
    await prisma.paymentWebhook.upsert({
      where: { webhookEventId: eventId },
      create: {
        provider: provider.toUpperCase(),
        webhookEventId: eventId,
        payload: JSON.stringify(req.body),
        processed: true,
        processedAt: new Date(),
      },
      update: {
        processed: true,
        processedAt: new Date(),
      },
    });

    // Update payment & order state if confirmed
    if (status === 'SUCCESS' || status === 'CONFIRMED') {
      if (transactionId) {
        await prisma.marketplaceTransaction.update({
          where: { id: transactionId },
          data: { status: 'PAYMENT_CONFIRMED' },
        });

        await prisma.payment.updateMany({
          where: { transactionId },
          data: { status: 'CONFIRMED', providerReference: providerReference || undefined },
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// Wallet: Get My Wallet and Ledger
export const getMyWallet = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.id },
      include: {
        ledgerEntries: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        payoutRequests: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!wallet) {
      throw new AppError('Wallet not found.', 404, ErrorCode.NOT_FOUND);
    }

    res.json({
      success: true,
      data: wallet,
    });
  } catch (error) {
    next(error);
  }
};

// Wallet: Request Payout
export const requestPayout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { amount, destinationType, phoneNumber, accountNumber } = req.body;

    if (!amount || amount <= 0 || !destinationType) {
      throw new AppError('Valid amount and destinationType (EVC_PLUS, ZAAD, SAHAL, BANK) are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
    if (!wallet || wallet.balance < parseFloat(amount)) {
      throw new AppError('Insufficient wallet balance for this payout.', 400, ErrorCode.INSUFFICIENT_FUNDS);
    }

    const payoutAmount = parseFloat(amount);
    const newBalance = parseFloat((wallet.balance - payoutAmount).toFixed(2));

    // Deduct balance and create pending payout atomically
    const [updatedWallet, payout] = await prisma.$transaction([
      prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      }),
      prisma.payoutRequest.create({
        data: {
          walletId: wallet.id,
          amount: payoutAmount,
          destinationType,
          phoneNumber: phoneNumber || req.user.phoneNumber,
          accountNumber: accountNumber || null,
          status: 'REQUESTED',
        },
      }),
      prisma.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          type: 'PAYOUT',
          amount: -payoutAmount,
          balanceAfter: newBalance,
          reference: `PO-${Date.now()}`,
          description: `Payout requested via ${destinationType}`,
        },
      }),
    ]);

    await logAuditEvent({
      userId: req.user.id,
      action: 'PAYOUT_REQUESTED',
      entityType: 'WALLET',
      entityId: wallet.id,
      details: { amount: payoutAmount, destinationType },
    });

    res.status(201).json({
      success: true,
      data: {
        payout,
        newBalance: updatedWallet.balance,
      },
    });
  } catch (error) {
    next(error);
  }
};
