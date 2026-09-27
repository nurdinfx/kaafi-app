import { Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// List Wholesale RFQs
export const getWholesaleRFQs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status = 'OPEN', city } = req.query;

    const where: any = {};
    if (status) where.status = String(status);
    if (city) where.deliveryCity = { contains: String(city) };

    const rfqs = await prisma.wholesaleRFQ.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: { select: { id: true, fullName: true, phoneNumber: true } },
        _count: { select: { quotes: true } },
      },
    });

    res.json({
      success: true,
      data: rfqs,
    });
  } catch (error) {
    next(error);
  }
};

// Create B2B Wholesale RFQ
export const createWholesaleRFQ = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { title, description, requiredQty, unitOfMeasure, targetPrice, currency = 'USD', deliveryCity = 'Garoowe', deadline } = req.body;

    if (!title || !requiredQty || !unitOfMeasure) {
      throw new AppError('Title, required quantity, and unit of measure are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const rfq = await prisma.wholesaleRFQ.create({
      data: {
        buyerId: req.user.id,
        title,
        description: description || '',
        requiredQty: parseInt(requiredQty, 10),
        unitOfMeasure,
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
        currency,
        deliveryCity,
        deadline: deadline ? new Date(deadline) : null,
        status: 'OPEN',
      },
    });

    await logAuditEvent({
      userId: req.user.id,
      action: 'B2B_RFQ_CREATED',
      entityType: 'WHOLESALE_RFQ',
      entityId: rfq.id,
      details: { title, requiredQty, unitOfMeasure },
    });

    res.status(201).json({
      success: true,
      data: rfq,
    });
  } catch (error) {
    next(error);
  }
};

// Supplier: Submit Quote on RFQ
export const submitQuote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const rfqId = String(req.params.rfqId);
    const { unitPrice, currency = 'USD', moq = 1, deliveryDays = 3, notes } = req.body;

    if (!unitPrice || unitPrice <= 0) {
      throw new AppError('Valid unit price is required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const rfq = await prisma.wholesaleRFQ.findUnique({ where: { id: rfqId } });
    if (!rfq) {
      throw new AppError('RFQ not found.', 404, ErrorCode.NOT_FOUND);
    }

    const quote = await prisma.wholesaleQuote.create({
      data: {
        rfqId,
        supplierId: req.user.id,
        unitPrice: parseFloat(unitPrice),
        currency,
        moq: parseInt(moq, 10) || 1,
        deliveryDays: parseInt(deliveryDays, 10) || 3,
        notes: notes || null,
        status: 'SUBMITTED',
      },
    });

    await prisma.wholesaleRFQ.update({
      where: { id: rfqId },
      data: { status: 'RESPONSES_RECEIVED' },
    });

    await prisma.notification.create({
      data: {
        userId: rfq.buyerId,
        type: 'OFFER',
        title: 'New B2B Wholesale Quote Received',
        message: `A supplier quoted $${unitPrice}/${rfq.unitOfMeasure} for "${rfq.title}"`,
        linkUrl: `/wholesale/rfq/${rfq.id}`,
      },
    });

    res.status(201).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

// Buyer: Accept Quote and Create Wholesale Transaction
export const acceptQuote = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const quoteId = String(req.params.quoteId);

    const quote = await prisma.wholesaleQuote.findUnique({
      where: { id: quoteId },
      include: { rfq: true },
    });

    if (!quote) {
      throw new AppError('Quote not found.', 404, ErrorCode.NOT_FOUND);
    }

    if (quote.rfq.buyerId !== req.user.id) {
      throw new AppError('Only the RFQ creator can accept quotes.', 403, ErrorCode.FORBIDDEN);
    }

    await prisma.wholesaleQuote.update({
      where: { id: quoteId },
      data: { status: 'ACCEPTED' },
    });

    await prisma.wholesaleRFQ.update({
      where: { id: quote.rfqId },
      data: { status: 'AWARDED' },
    });

    const subtotal = quote.unitPrice * quote.rfq.requiredQty;
    const commissionRate = 3.0; // preferential wholesale commission
    const commissionAmount = parseFloat(((subtotal * commissionRate) / 100).toFixed(2));
    const txNumber = `B2B-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const transaction = await prisma.marketplaceTransaction.create({
      data: {
        transactionNumber: txNumber,
        buyerId: req.user.id,
        transactionType: 'WHOLESALE',
        subtotalAmount: subtotal,
        commissionAmount,
        commissionRateUsed: commissionRate,
        totalAmount: subtotal,
        currency: quote.currency,
        deliveryCity: quote.rfq.deliveryCity,
        status: 'PENDING_PAYMENT',
        statusHistory: {
          create: {
            fromStatus: 'DRAFT',
            toStatus: 'PENDING_PAYMENT',
            notes: `Wholesale contract awarded from RFQ: ${quote.rfq.title}`,
            changedBy: req.user.id,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        quote,
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};
