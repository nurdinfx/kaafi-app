import { Request, Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// List public buyer requests
export const getBuyerRequests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { categoryId, city, status = 'OPEN' } = req.query;

    const where: any = {};
    if (status) where.status = String(status);
    if (categoryId) where.categoryId = String(categoryId);
    if (city) where.city = { contains: String(city) };

    const requests = await prisma.buyerRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true, slug: true, verticalType: true } },
        buyer: { select: { id: true, fullName: true, city: true, avatarUrl: true } },
        _count: { select: { offers: true } },
      },
    });

    res.json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

// Create a Buyer Request ("Request What You Need")
export const createBuyerRequest = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { categoryId, title, description, targetBudget, currency = 'USD', quantity = 1, city = 'Garoowe', landmark, urgency = 'NORMAL' } = req.body;

    if (!categoryId || !title || !description) {
      throw new AppError('Category, title, and description are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const request = await prisma.buyerRequest.create({
      data: {
        buyerId: req.user.id,
        categoryId,
        title,
        description,
        targetBudget: targetBudget ? parseFloat(targetBudget) : null,
        currency,
        quantity: parseInt(quantity, 10) || 1,
        city,
        landmark: landmark || null,
        urgency,
      },
      include: {
        category: true,
      },
    });

    // Notify matching sellers in this category/city
    const matchingSellers = await prisma.listing.findMany({
      where: {
        categoryId,
        city: { contains: city },
        status: 'ACTIVE',
      },
      select: { sellerId: true },
      distinct: ['sellerId'],
      take: 10,
    });

    for (const s of matchingSellers) {
      if (s.sellerId !== req.user.id) {
        await prisma.notification.create({
          data: {
            userId: s.sellerId,
            type: 'OFFER',
            title: 'New Customer Request in Your Category',
            message: `A buyer in ${city} is looking for: "${title}". Submit an offer now!`,
            linkUrl: `/requests/${request.id}`,
          },
        });
      }
    }

    await logAuditEvent({
      userId: req.user.id,
      action: 'BUYER_REQUEST_CREATED',
      entityType: 'BUYER_REQUEST',
      entityId: request.id,
      details: { title, targetBudget, city },
    });

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

// Get single request details with received offers (only buyer sees all offers)
export const getRequestDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);

    const request = await prisma.buyerRequest.findUnique({
      where: { id },
      include: {
        category: true,
        buyer: { select: { id: true, fullName: true, phoneNumber: true } },
        offers: {
          include: {
            seller: { select: { id: true, fullName: true, phoneNumber: true, avatarUrl: true } },
            listing: { select: { id: true, title: true, price: true, slug: true } },
            history: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });

    if (!request) {
      throw new AppError('Request not found.', 404, ErrorCode.NOT_FOUND);
    }

    res.json({
      success: true,
      data: request,
    });
  } catch (error) {
    next(error);
  }
};
