"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProductVariant = exports.getLowStockAlerts = exports.getListingStockMovements = exports.transferBranchStock = exports.recordStockMovement = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const audit_1 = require("../../middleware/audit");
// ----------------------------------------------------
// AUDITABLE INVENTORY & STOCK MOVEMENTS
// ----------------------------------------------------
/**
 * Record an auditable stock movement (Restock, Damage write-off, Audit adjustment)
 * Rule: Never modify inventory silently; every change creates an immutable StockMovement.
 */
const recordStockMovement = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { listingId, branchId, movementType, quantityChange, reference, notes } = req.body;
        if (!listingId || !movementType || quantityChange === undefined || quantityChange === 0) {
            throw new errorHandler_1.AppError('listingId, movementType, and non-zero quantityChange are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const validTypes = ['RESTOCK', 'SALE_DEDUCTION', 'REFUND_RESTORE', 'DAMAGE_WRITE_OFF', 'BRANCH_TRANSFER', 'AUDIT_ADJUSTMENT'];
        if (!validTypes.includes(movementType)) {
            throw new errorHandler_1.AppError(`Invalid movementType. Must be one of: ${validTypes.join(', ')}`, 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const listing = await db_1.default.listing.findUnique({
            where: { id: listingId },
            include: { business: true },
        });
        if (!listing) {
            throw new errorHandler_1.AppError('Listing not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        // Authorization: owner or business staff with inventory permissions
        const isOwner = listing.sellerId === req.user.id;
        const isBusinessOwner = listing.business?.ownerId === req.user.id;
        const isAdmin = req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('OPERATIONS_ADMIN');
        if (!isOwner && !isBusinessOwner && !isAdmin) {
            throw new errorHandler_1.AppError('You do not have permission to manage inventory for this listing.', 403, types_1.ErrorCode.FORBIDDEN);
        }
        const quantityBefore = listing.inventoryCount;
        const quantityAfter = quantityBefore + parseInt(quantityChange, 10);
        if (quantityAfter < 0) {
            throw new errorHandler_1.AppError(`Insufficient inventory. Current stock: ${quantityBefore}, attempted reduction: ${Math.abs(quantityChange)}`, 400, types_1.ErrorCode.BAD_REQUEST);
        }
        // Atomic transaction: Update listing inventory count and create immutable StockMovement audit record
        const [updatedListing, movement] = await db_1.default.$transaction([
            db_1.default.listing.update({
                where: { id: listingId },
                data: {
                    inventoryCount: quantityAfter,
                    status: quantityAfter === 0 ? 'SOLD' : listing.status === 'SOLD' ? 'ACTIVE' : listing.status,
                },
            }),
            db_1.default.stockMovement.create({
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
        await (0, audit_1.logAuditEvent)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.recordStockMovement = recordStockMovement;
/**
 * Transfer inventory between business branches
 */
const transferBranchStock = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { listingId, sourceBranchId, targetBranchId, quantity, notes } = req.body;
        if (!listingId || !sourceBranchId || !targetBranchId || !quantity || quantity <= 0) {
            throw new errorHandler_1.AppError('listingId, sourceBranchId, targetBranchId, and positive quantity are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        if (sourceBranchId === targetBranchId) {
            throw new errorHandler_1.AppError('Source and target branches must be different.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const listing = await db_1.default.listing.findUnique({
            where: { id: listingId },
            include: { business: true },
        });
        if (!listing) {
            throw new errorHandler_1.AppError('Listing not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        // Verify ownership of business
        if (listing.business?.ownerId !== req.user.id && !req.user.roles.includes('SUPER_ADMIN')) {
            throw new errorHandler_1.AppError('Access denied: You do not own the business associated with this inventory.', 403, types_1.ErrorCode.FORBIDDEN);
        }
        // Verify both branches belong to the same business
        const [sourceBranch, targetBranch] = await Promise.all([
            db_1.default.businessBranch.findUnique({ where: { id: sourceBranchId } }),
            db_1.default.businessBranch.findUnique({ where: { id: targetBranchId } }),
        ]);
        if (!sourceBranch || !targetBranch || sourceBranch.businessId !== listing.businessId || targetBranch.businessId !== listing.businessId) {
            throw new errorHandler_1.AppError('Both branches must exist and belong to the same business.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const transferRef = `XFER-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
        // Create dual movements for source deduction and destination addition
        const [deductionMovement, additionMovement] = await db_1.default.$transaction([
            db_1.default.stockMovement.create({
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
            db_1.default.stockMovement.create({
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
        await (0, audit_1.logAuditEvent)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.transferBranchStock = transferBranchStock;
/**
 * Get audit trail of stock movements for a specific listing
 */
const getListingStockMovements = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const listingId = String(req.params.listingId);
        const listing = await db_1.default.listing.findUnique({
            where: { id: listingId },
            include: { business: true },
        });
        if (!listing) {
            throw new errorHandler_1.AppError('Listing not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        const isOwner = listing.sellerId === req.user.id;
        const isBusinessOwner = listing.business?.ownerId === req.user.id;
        const isAdmin = req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('OPERATIONS_ADMIN');
        if (!isOwner && !isBusinessOwner && !isAdmin) {
            throw new errorHandler_1.AppError('Access denied.', 403, types_1.ErrorCode.FORBIDDEN);
        }
        const movements = await db_1.default.stockMovement.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getListingStockMovements = getListingStockMovements;
/**
 * Get low-stock alerts for a seller / business
 */
const getLowStockAlerts = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        // Find listings owned by user or user's business with inventory <= lowStockThreshold
        const alerts = await db_1.default.listing.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getLowStockAlerts = getLowStockAlerts;
/**
 * Create or update product variants (SKUs, size/color variations)
 */
const createProductVariant = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { listingId, name, sku, priceModifier = 0.0, inventoryCount = 0 } = req.body;
        if (!listingId || !name) {
            throw new errorHandler_1.AppError('listingId and variant name are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const listing = await db_1.default.listing.findUnique({
            where: { id: listingId },
            include: { business: true },
        });
        if (!listing) {
            throw new errorHandler_1.AppError('Listing not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        const isOwner = listing.sellerId === req.user.id || listing.business?.ownerId === req.user.id;
        if (!isOwner && !req.user.roles.includes('SUPER_ADMIN')) {
            throw new errorHandler_1.AppError('Access denied.', 403, types_1.ErrorCode.FORBIDDEN);
        }
        const variant = await db_1.default.productVariant.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.createProductVariant = createProductVariant;
