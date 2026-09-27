import { Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// ----------------------------------------------------
// AUDITABLE INVENTORY & STOCK MOVEMENTS
// ----------------------------------------------------

/**
 * Record an auditable stock movement (Restock, Damage write-off, Audit adjustment)
 * Rule: Never modify inventory silently; every change creates an immutable StockMovement.
 */
export const recordStockMovement = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { listingId, branchId, movementType, quantityChange, reference, notes } = req.body;

    if (!listingId || !movementType || quantityChange === undefined || quantityChange === 0) {
      throw new AppError('listingId, movementType, and non-zero quantityChange are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const validTypes = ['RESTOCK', 'SALE_DEDUCTION', 'REFUND_RESTORE', 'DAMAGE_WRITE_OFF', 'BRANCH_TRANSFER', 'AUDIT_ADJUSTMENT'];
    if (!validTypes.includes(movementType)) {
      throw new AppError(`Invalid movementType. Must be one of: ${validTypes.join(', ')}`, 400, ErrorCode.VALIDATION_ERROR);
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { business: true },
    });

    if (!listing) {
      throw new AppError('Listing not found.', 404, ErrorCode.NOT_FOUND);
    }

    // Authorization: owner or business staff with inventory permissions
    const isOwner = listing.sellerId === req.user.id;
    const isBusinessOwner = listing.business?.ownerId === req.user.id;
    const isAdmin = req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('OPERATIONS_ADMIN');

    if (!isOwner && !isBusinessOwner && !isAdmin) {
      throw new AppError('You do not have permission to manage inventory for this listing.', 403, ErrorCode.FORBIDDEN);
    }

    const quantityBefore = listing.inventoryCount;
    const quantityAfter = quantityBefore + parseInt(quantityChange, 10);

    if (quantityAfter < 0) {
      throw new AppError(`Insufficient inventory. Current stock: ${quantityBefore}, attempted reduction: ${Math.abs(quantityChange)}`, 400, ErrorCode.BAD_REQUEST);
    }

    // Atomic transaction: Update listing inventory count and create immutable StockMovement audit record
    const [updatedListing, movement] = await prisma.$transaction([
      prisma.listing.update({
        where: { id: listingId },
        data: {
          inventoryCount: quantityAfter,
          status: quantityAfter === 0 ? 'SOLD' : listing.status === 'SOLD' ? 'ACTIVE' : listing.status,
        },
      }),
      prisma.stockMovement.create({
        data: {
          listingId,
          branchId: branchId || listing.branchId || null,
          movementType,
          quantityChange: parseInt(quantityChange, 10),
          quantityBefore,
          quantityAfter,
          reference: reference || `ADJ-${Date.now()}`,
          notes: notes || null,
          performedBy: req.user.id,
        },
      }),
    ]);

    await logAuditEvent({
      userId: req.user.id,
      action: `INVENTORY_${movementType}`,
      entityType: 'INVENTORY',
      entityId: listingId,
      details: { quantityBefore, quantityChange, quantityAfter, reference },
    });

    res.status(201).json({
      success: true,
      data: {
        listing: updatedListing,
        stockMovement: movement,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Transfer inventory between business branches
 */
export const transferBranchStock = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { listingId, sourceBranchId, targetBranchId, quantity, notes } = req.body;

    if (!listingId || !sourceBranchId || !targetBranchId || !quantity || quantity <= 0) {
      throw new AppError('listingId, sourceBranchId, targetBranchId, and positive quantity are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    if (sourceBranchId === targetBranchId) {
      throw new AppError('Source and target branches must be different.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { business: true },
    });

    if (!listing) {
      throw new AppError('Listing not found.', 404, ErrorCode.NOT_FOUND);
    }

    // Verify ownership of business
    if (listing.business?.ownerId !== req.user.id && !req.user.roles.includes('SUPER_ADMIN')) {
      throw new AppError('Access denied: You do not own the business associated with this inventory.', 403, ErrorCode.FORBIDDEN);
    }

    // Verify both branches belong to the same business
    const [sourceBranch, targetBranch] = await Promise.all([
      prisma.businessBranch.findUnique({ where: { id: sourceBranchId } }),
      prisma.businessBranch.findUnique({ where: { id: targetBranchId } }),
    ]);

    if (!sourceBranch || !targetBranch || sourceBranch.businessId !== listing.businessId || targetBranch.businessId !== listing.businessId) {
      throw new AppError('Both branches must exist and belong to the same business.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const transferRef = `XFER-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Create dual movements for source deduction and destination addition
    const [deductionMovement, additionMovement] = await prisma.$transaction([
      prisma.stockMovement.create({
        data: {
          listingId,
          branchId: sourceBranchId,
          movementType: 'BRANCH_TRANSFER',
          quantityChange: -quantity,
          quantityBefore: listing.inventoryCount,
          quantityAfter: listing.inventoryCount - quantity,
          reference: transferRef,
          notes: `Transfer out to ${targetBranch.branchName}. ${notes || ''}`.trim(),
          performedBy: req.user.id,
        },
      }),
      prisma.stockMovement.create({
        data: {
          listingId,
          branchId: targetBranchId,
          movementType: 'BRANCH_TRANSFER',
          quantityChange: quantity,
          quantityBefore: listing.inventoryCount - quantity,
          quantityAfter: listing.inventoryCount,
          reference: transferRef,
          notes: `Transfer in from ${sourceBranch.branchName}. ${notes || ''}`.trim(),
          performedBy: req.user.id,
        },
      }),
    ]);

    await logAuditEvent({
      userId: req.user.id,
      action: 'INVENTORY_BRANCH_TRANSFER',
      entityType: 'INVENTORY',
      entityId: listingId,
      details: { transferRef, sourceBranchId, targetBranchId, quantity },
    });

    res.json({
      success: true,
      data: {
        transferReference: transferRef,
        sourceMovement: deductionMovement,
        targetMovement: additionMovement,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get audit trail of stock movements for a specific listing
 */
export const getListingStockMovements = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const listingId = String(req.params.listingId);
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { business: true },
    });

    if (!listing) {
      throw new AppError('Listing not found.', 404, ErrorCode.NOT_FOUND);
    }

    const isOwner = listing.sellerId === req.user.id;
    const isBusinessOwner = listing.business?.ownerId === req.user.id;
    const isAdmin = req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('OPERATIONS_ADMIN');

    if (!isOwner && !isBusinessOwner && !isAdmin) {
      throw new AppError('Access denied.', 403, ErrorCode.FORBIDDEN);
    }

    const movements = await prisma.stockMovement.findMany({
      where: { listingId },
      orderBy: { createdAt: 'desc' },
      include: {
        branch: { select: { id: true, branchName: true, city: true } },
      },
    });

    res.json({
      success: true,
      data: movements,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get low-stock alerts for a seller / business
 */
export const getLowStockAlerts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    // Find listings owned by user or user's business with inventory <= lowStockThreshold
    const alerts = await prisma.listing.findMany({
      where: {
        OR: [
          { sellerId: req.user.id },
          { business: { ownerId: req.user.id } },
        ],
        status: 'ACTIVE',
        inventoryCount: { lte: 2 }, // Default low stock threshold
      },
      select: {
        id: true,
        title: true,
        sku: true,
        inventoryCount: true,
        lowStockThreshold: true,
        price: true,
        currency: true,
        branch: { select: { id: true, branchName: true } },
      },
      orderBy: { inventoryCount: 'asc' },
    });

    res.json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update product variants (SKUs, size/color variations)
 */
export const createProductVariant = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { listingId, name, sku, priceModifier = 0.0, inventoryCount = 0 } = req.body;

    if (!listingId || !name) {
      throw new AppError('listingId and variant name are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { business: true },
    });

    if (!listing) {
      throw new AppError('Listing not found.', 404, ErrorCode.NOT_FOUND);
    }

    const isOwner = listing.sellerId === req.user.id || listing.business?.ownerId === req.user.id;
    if (!isOwner && !req.user.roles.includes('SUPER_ADMIN')) {
      throw new AppError('Access denied.', 403, ErrorCode.FORBIDDEN);
    }

    const variant = await prisma.productVariant.create({
      data: {
        listingId,
        name,
        sku: sku || null,
        priceModifier: parseFloat(priceModifier),
        inventoryCount: parseInt(inventoryCount, 10),
      },
    });

    res.status(201).json({
      success: true,
      data: variant,
    });
  } catch (error) {
    next(error);
  }
};
