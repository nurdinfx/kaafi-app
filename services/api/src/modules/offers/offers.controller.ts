import { Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// Create an offer (from buyer to seller on a listing or in response to a request)
export const createOffer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { listingId, requestId, offeredPrice, currency = 'USD', quantity = 1, notes } = req.body;

    if (!offeredPrice || offeredPrice <= 0) {
      throw new AppError('Valid offer price is required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    let sellerId = req.body.sellerId;

    if (listingId) {
      const listing = await prisma.listing.findUnique({ where: { id: listingId } });
      if (!listing) {
        throw new AppError('Listing not found.', 404, ErrorCode.NOT_FOUND);
      }
      sellerId = listing.sellerId;
    } else if (requestId) {
      // In response to a request, the sender is a seller making an offer to the buyer
      const request = await prisma.buyerRequest.findUnique({ where: { id: requestId } });
      if (!request) {
        throw new AppError('Request not found.', 404, ErrorCode.NOT_FOUND);
      }
      // If seller responding to buyer request:
      // buyer is request.buyerId, seller is current user
      const offer = await prisma.offer.create({
        data: {
          requestId,
          listingId: listingId || null,
          buyerId: request.buyerId,
          sellerId: req.user.id,
          offeredPrice: parseFloat(offeredPrice),
          currency,
          quantity: parseInt(quantity, 10) || 1,
          status: 'PENDING',
          notes: notes || null,
          history: {
            create: {
              actorId: req.user.id,
              action: 'OFFERED',
              price: parseFloat(offeredPrice),
              notes: notes || null,
            },
          },
        },
      });

      await prisma.notification.create({
        data: {
          userId: request.buyerId,
          type: 'OFFER',
          title: 'Offer Received on Your Request',
          message: `A seller submitted an offer of $${offeredPrice} on "${request.title}"`,
          linkUrl: `/requests/${request.id}`,
        },
      });

      res.status(201).json({ success: true, data: offer });
      return;
    }

    if (!sellerId) {
      throw new AppError('Seller ID is required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    if (sellerId === req.user.id) {
      throw new AppError('You cannot submit an offer to yourself.', 400, ErrorCode.BAD_REQUEST);
    }

    const offer = await prisma.offer.create({
      data: {
        listingId: listingId || null,
        requestId: requestId || null,
        buyerId: req.user.id,
        sellerId,
        offeredPrice: parseFloat(offeredPrice),
        currency,
        quantity: parseInt(quantity, 10) || 1,
        status: 'PENDING',
        notes: notes || null,
        history: {
          create: {
            actorId: req.user.id,
            action: 'OFFERED',
            price: parseFloat(offeredPrice),
            notes: notes || null,
          },
        },
      },
      include: {
        listing: { select: { id: true, title: true } },
      },
    });

    await prisma.notification.create({
      data: {
        userId: sellerId,
        type: 'OFFER',
        title: 'New Price Offer Received',
        message: `${req.user.fullName} offered $${offeredPrice} on "${offer.listing?.title || 'item'}"`,
        linkUrl: `/offers/${offer.id}`,
      },
    });

    res.status(201).json({
      success: true,
      data: offer,
    });
  } catch (error) {
    next(error);
  }
};

// Counter an offer (e.g. seller counters buyer's $600 with $650)
export const counterOffer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const id = String(req.params.id);
    const { counterPrice, notes } = req.body;

    if (!counterPrice || counterPrice <= 0) {
      throw new AppError('Valid counter price is required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer) {
      throw new AppError('Offer not found.', 404, ErrorCode.NOT_FOUND);
    }

    // Only buyer or seller can counter
    if (offer.buyerId !== req.user.id && offer.sellerId !== req.user.id) {
      throw new AppError('Not authorized to modify this offer.', 403, ErrorCode.FORBIDDEN);
    }

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        status: 'COUNTERED',
        counterPrice: parseFloat(counterPrice),
        notes: notes || null,
        history: {
          create: {
            actorId: req.user.id,
            action: 'COUNTERED',
            price: parseFloat(counterPrice),
            notes: notes || null,
          },
        },
      },
    });

    const recipientId = req.user.id === offer.buyerId ? offer.sellerId : offer.buyerId;
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'OFFER',
        title: 'Counter-Offer Received',
        message: `Counter-offer of $${counterPrice} received.`,
        linkUrl: `/offers/${offer.id}`,
      },
    });

    res.json({
      success: true,
      data: updatedOffer,
    });
  } catch (error) {
    next(error);
  }
};

// Accept an offer or counter-offer
export const acceptOffer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const id = String(req.params.id);

    const offer = await prisma.offer.findUnique({
      where: { id },
      include: { listing: true },
    });

    if (!offer) {
      throw new AppError('Offer not found.', 404, ErrorCode.NOT_FOUND);
    }

    if (offer.buyerId !== req.user.id && offer.sellerId !== req.user.id) {
      throw new AppError('Not authorized to accept this offer.', 403, ErrorCode.FORBIDDEN);
    }

    const finalPrice = offer.status === 'COUNTERED' && offer.counterPrice ? offer.counterPrice : offer.offeredPrice;

    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        history: {
          create: {
            actorId: req.user.id,
            action: 'ACCEPTED',
            price: finalPrice,
            notes: 'Offer accepted by partner.',
          },
        },
      },
    });

    // Create an initial MarketplaceTransaction for checkout
    const txNumber = `TX-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const commissionRate = 5.0; // standard commission
    const subtotal = finalPrice * offer.quantity;
    const commissionAmount = parseFloat(((subtotal * commissionRate) / 100).toFixed(2));

    const transaction = await prisma.marketplaceTransaction.create({
      data: {
        transactionNumber: txNumber,
        buyerId: offer.buyerId,
        transactionType: 'NEGOTIATION',
        offerId: offer.id,
        subtotalAmount: subtotal,
        commissionAmount,
        commissionRateUsed: commissionRate,
        totalAmount: subtotal,
        currency: offer.currency,
        status: 'PENDING_PAYMENT',
        deliveryCity: 'Garoowe',
        items: offer.listingId
          ? {
              create: {
                listingId: offer.listingId,
                sellerId: offer.sellerId,
                quantity: offer.quantity,
                unitPrice: finalPrice,
                totalPrice: subtotal,
                currency: offer.currency,
              },
            }
          : undefined,
        statusHistory: {
          create: {
            fromStatus: 'DRAFT',
            toStatus: 'PENDING_PAYMENT',
            notes: 'Transaction created from accepted offer.',
            changedBy: req.user.id,
          },
        },
      },
    });

    await logAuditEvent({
      userId: req.user.id,
      action: 'OFFER_ACCEPTED',
      entityType: 'OFFER',
      entityId: offer.id,
      details: { finalPrice, transactionId: transaction.id },
    });

    res.json({
      success: true,
      data: {
        offer: updatedOffer,
        transaction,
      },
    });
  } catch (error) {
    next(error);
  }
};
