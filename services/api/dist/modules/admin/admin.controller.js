"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminClearSystemData = exports.adminDeleteCategory = exports.adminUpdateCategory = exports.adminCreateCategory = exports.adminGetCategories = exports.adminDeleteListing = exports.adminUpdateListing = exports.adminCreateListing = exports.adminGetAllListings = exports.createAdminUserAdmin = exports.getLiveActivityAdmin = exports.deleteStoreAdmin = exports.updateStoreStatusAdmin = exports.getStoresAdmin = exports.updateTransactionStatusAdmin = exports.getTransactionsAdmin = exports.updateCategoryCommissionAdmin = exports.moderateListingAdmin = exports.updateUserStatusAdmin = exports.getUsersAdmin = exports.getAuditLogs = exports.processPayout = exports.reviewVerification = exports.getPlatformAnalytics = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const audit_1 = require("../../middleware/audit");
// Real Platform Analytics (GMV, Commission, Users, Active Orders) - NO MOCK DATA
const getPlatformAnalytics = async (req, res, next) => {
    try {
        const [totalUsers, totalSellers, totalBusinesses, totalListings, totalTransactions, completedTransactions, auditLogsCount,] = await Promise.all([
            db_1.default.user.count(),
            db_1.default.sellerProfile.count(),
            db_1.default.businessProfile.count(),
            db_1.default.listing.count({ where: { status: 'ACTIVE' } }),
            db_1.default.marketplaceTransaction.count(),
            db_1.default.marketplaceTransaction.findMany({
                where: { status: { in: ['COMPLETED', 'PAYMENT_CONFIRMED', 'DELIVERED'] } },
                select: { totalAmount: true, commissionAmount: true },
            }),
            db_1.default.auditLog.count(),
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
    }
    catch (error) {
        next(error);
    }
};
exports.getPlatformAnalytics = getPlatformAnalytics;
// Admin: Review & Approve Verification Request
const reviewVerification = async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const { status, rejectionReason } = req.body; // APPROVED or REJECTED
        if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
            throw new errorHandler_1.AppError('Status must be APPROVED or REJECTED.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const verification = await db_1.default.verificationRequest.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!verification) {
            throw new errorHandler_1.AppError('Verification request not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        const updated = await db_1.default.verificationRequest.update({
            where: { id },
            data: {
                status,
                rejectionReason: status === 'REJECTED' ? rejectionReason || 'Documentation insufficient' : null,
                reviewedAt: new Date(),
            },
        });
        // If approved, update target profile
        if (status === 'APPROVED') {
            await db_1.default.user.update({
                where: { id: verification.userId },
                data: { verificationStatus: 'VERIFIED' },
            });
            if (verification.targetType === 'SELLER') {
                await db_1.default.sellerProfile.updateMany({
                    where: { userId: verification.userId },
                    data: { isVerified: true },
                });
            }
            else if (verification.targetType === 'BUSINESS' && verification.targetId) {
                await db_1.default.businessProfile.update({
                    where: { id: verification.targetId },
                    data: { isVerified: true },
                });
                // Automatically verify and activate all listings belonging to this business so they are public
                try {
                    await db_1.default.listing.updateMany({
                        where: { businessId: verification.targetId },
                        data: {
                            status: 'ACTIVE',
                            verificationStatus: 'VERIFIED',
                        },
                    });
                }
                catch (lErr) {
                    console.warn('[Review Verification] Listing update failed:', lErr?.message);
                }
            }
        }
        await (0, audit_1.logAuditEvent)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.reviewVerification = reviewVerification;
// Admin: Process Payout Request
const processPayout = async (req, res, next) => {
    try {
        const payoutId = String(req.params.payoutId);
        const { status, adminNotes } = req.body; // COMPLETED or REJECTED
        if (!status || !['COMPLETED', 'FAILED'].includes(status)) {
            throw new errorHandler_1.AppError('Status must be COMPLETED or FAILED.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const payout = await db_1.default.payoutRequest.findUnique({
            where: { id: payoutId },
            include: { wallet: true },
        });
        if (!payout) {
            throw new errorHandler_1.AppError('Payout request not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        if (payout.status !== 'REQUESTED') {
            throw new errorHandler_1.AppError(`Payout is already in ${payout.status} state.`, 400, types_1.ErrorCode.BAD_REQUEST);
        }
        const updatedPayout = await db_1.default.payoutRequest.update({
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
            await db_1.default.wallet.update({
                where: { id: payout.walletId },
                data: { balance: newBalance },
            });
            await db_1.default.ledgerEntry.create({
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
        await (0, audit_1.logAuditEvent)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.processPayout = processPayout;
// Admin: View Append-Only Audit Logs
const getAuditLogs = async (req, res, next) => {
    try {
        const { page = '1', limit = '50', action, entityType } = req.query;
        const pageNum = parseInt(String(page), 10) || 1;
        const limitNum = parseInt(String(limit), 10) || 50;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (action)
            where.action = String(action);
        if (entityType)
            where.entityType = String(entityType);
        const [total, logs] = await Promise.all([
            db_1.default.auditLog.count({ where }),
            db_1.default.auditLog.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAuditLogs = getAuditLogs;
// Admin: Query Users with Role & Status Filtering
const getUsersAdmin = async (req, res, next) => {
    try {
        const { role, search, page = '1', limit = '20' } = req.query;
        const pageNum = parseInt(String(page), 10) || 1;
        const limitNum = parseInt(String(limit), 10) || 20;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
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
            db_1.default.user.count({ where }),
            db_1.default.user.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getUsersAdmin = getUsersAdmin;
// Admin: Deactivate / Ban or Reactivate User (supports isActive and/or verificationStatus)
const updateUserStatusAdmin = async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const { isActive, verificationStatus, reason } = req.body;
        // At least one field must be provided
        if (isActive === undefined && verificationStatus === undefined) {
            throw new errorHandler_1.AppError('At least one of isActive or verificationStatus is required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const updateData = {};
        if (isActive !== undefined)
            updateData.isActive = !!isActive;
        if (verificationStatus !== undefined)
            updateData.verificationStatus = String(verificationStatus);
        const updated = await db_1.default.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                fullName: true,
                phoneNumber: true,
                isActive: true,
                verificationStatus: true,
            },
        });
        await (0, audit_1.logAuditEvent)({
            userId: req.user?.id,
            action: isActive !== undefined
                ? (isActive ? 'USER_REACTIVATED' : 'USER_SUSPENDED')
                : 'USER_VERIFICATION_UPDATED',
            entityType: 'USER',
            entityId: id,
            details: { isActive, verificationStatus, reason },
        });
        res.json({
            success: true,
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserStatusAdmin = updateUserStatusAdmin;
// Admin: Moderate Listing (Archive, Activate, Verify)
const moderateListingAdmin = async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const { status, verificationStatus, moderationNotes } = req.body;
        const data = {};
        if (status)
            data.status = String(status);
        if (verificationStatus)
            data.verificationStatus = String(verificationStatus);
        const listing = await db_1.default.listing.update({
            where: { id },
            data,
        });
        await (0, audit_1.logAuditEvent)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.moderateListingAdmin = moderateListingAdmin;
// Admin: Update Category Commission Rate
const updateCategoryCommissionAdmin = async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const { commissionRate } = req.body;
        if (commissionRate === undefined || isNaN(parseFloat(commissionRate))) {
            throw new errorHandler_1.AppError('Valid commissionRate number is required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const updated = await db_1.default.category.update({
            where: { id },
            data: { commissionRate: parseFloat(commissionRate) },
        });
        await (0, audit_1.logAuditEvent)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateCategoryCommissionAdmin = updateCategoryCommissionAdmin;
// Admin: Control All Transactions & Orders across App & Web
const getTransactionsAdmin = async (req, res, next) => {
    try {
        const { page = '1', limit = '30', status, paymentProvider, search, fulfillmentType } = req.query;
        const pageNum = parseInt(String(page), 10) || 1;
        const limitNum = parseInt(String(limit), 10) || 30;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (status && status !== 'ALL')
            where.status = String(status);
        if (fulfillmentType && fulfillmentType !== 'ALL')
            where.fulfillmentType = String(fulfillmentType);
        if (search) {
            where.OR = [
                { transactionNumber: { contains: String(search) } },
                { recipientPhone: { contains: String(search) } },
                { deliveryCity: { contains: String(search) } },
                { buyer: { fullName: { contains: String(search) } } },
                { buyer: { phoneNumber: { contains: String(search) } } },
            ];
        }
        if (paymentProvider && paymentProvider !== 'ALL') {
            where.payments = { some: { provider: String(paymentProvider) } };
        }
        const [total, transactions, stats] = await Promise.all([
            db_1.default.marketplaceTransaction.count({ where }),
            db_1.default.marketplaceTransaction.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    buyer: {
                        select: { id: true, fullName: true, phoneNumber: true, email: true },
                    },
                    items: {
                        include: {
                            listing: {
                                select: { id: true, title: true, price: true, currency: true, media: { take: 1 } },
                            },
                        },
                    },
                    payments: {
                        take: 3,
                        orderBy: { createdAt: 'desc' },
                    },
                    escrowHold: true,
                    deliveryJob: {
                        include: {
                            driver: {
                                include: {
                                    user: { select: { fullName: true, phoneNumber: true } },
                                },
                            },
                        },
                    },
                    disputes: true,
                    statusHistory: {
                        take: 5,
                        orderBy: { createdAt: 'desc' },
                    },
                },
            }),
            db_1.default.marketplaceTransaction.aggregate({
                _sum: { totalAmount: true, commissionAmount: true },
                _count: { id: true },
            }),
        ]);
        res.json({
            success: true,
            data: transactions,
            summary: {
                totalVolume: stats._sum.totalAmount || 0,
                totalCommission: stats._sum.commissionAmount || 0,
                totalCount: stats._count.id || 0,
            },
            meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTransactionsAdmin = getTransactionsAdmin;
// Admin: Update Transaction or Order Status & Escrow Release/Refund Controls
const updateTransactionStatusAdmin = async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const { status, notes, releaseEscrow, refundBuyer } = req.body;
        const tx = await db_1.default.marketplaceTransaction.findUnique({
            where: { id },
            include: {
                items: true,
                escrowHold: true,
                buyer: { include: { wallet: true } },
            },
        });
        if (!tx) {
            throw new errorHandler_1.AppError('Transaction not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        const oldStatus = tx.status;
        const updateData = {};
        if (status)
            updateData.status = status;
        const updated = await db_1.default.marketplaceTransaction.update({
            where: { id },
            data: updateData,
        });
        // Record transition in TransactionStatusHistory
        await db_1.default.transactionStatusHistory.create({
            data: {
                transactionId: id,
                fromStatus: oldStatus,
                toStatus: status || oldStatus,
                notes: notes || 'Super-Admin manual status update',
                changedBy: req.user?.id || 'SUPER_ADMIN',
            },
        });
        // If releaseEscrow is requested, complete escrow and credit seller wallet
        if (releaseEscrow && tx.escrowHold && tx.escrowHold.status === 'HELD') {
            const sellerId = tx.items[0]?.sellerId;
            if (sellerId) {
                let sellerWallet = await db_1.default.wallet.findUnique({ where: { userId: sellerId } });
                if (!sellerWallet) {
                    sellerWallet = await db_1.default.wallet.create({
                        data: { userId: sellerId, balance: 0, pendingBalance: 0 },
                    });
                }
                const netAmount = parseFloat((tx.subtotalAmount - tx.commissionAmount).toFixed(2));
                const newBalance = parseFloat((sellerWallet.balance + netAmount).toFixed(2));
                await db_1.default.wallet.update({
                    where: { id: sellerWallet.id },
                    data: { balance: newBalance },
                });
                await db_1.default.ledgerEntry.create({
                    data: {
                        walletId: sellerWallet.id,
                        type: 'CREDIT',
                        amount: netAmount,
                        balanceAfter: newBalance,
                        reference: `ESCROW-REL-${tx.transactionNumber}`,
                        description: `Super Admin released escrow for #${tx.transactionNumber}`,
                    },
                });
                await db_1.default.escrowHold.update({
                    where: { id: tx.escrowHold.id },
                    data: { status: 'RELEASED', releasedAt: new Date() },
                });
            }
        }
        // If refundBuyer is requested, refund total amount to buyer wallet
        if (refundBuyer && tx.buyerId) {
            let buyerWallet = await db_1.default.wallet.findUnique({ where: { userId: tx.buyerId } });
            if (!buyerWallet) {
                buyerWallet = await db_1.default.wallet.create({
                    data: { userId: tx.buyerId, balance: 0, pendingBalance: 0 },
                });
            }
            const newBalance = parseFloat((buyerWallet.balance + tx.totalAmount).toFixed(2));
            await db_1.default.wallet.update({
                where: { id: buyerWallet.id },
                data: { balance: newBalance },
            });
            await db_1.default.ledgerEntry.create({
                data: {
                    walletId: buyerWallet.id,
                    type: 'REFUND',
                    amount: tx.totalAmount,
                    balanceAfter: newBalance,
                    reference: `REFUND-${tx.transactionNumber}`,
                    description: `Super Admin refunded transaction #${tx.transactionNumber}`,
                },
            });
            if (tx.escrowHold && tx.escrowHold.status === 'HELD') {
                await db_1.default.escrowHold.update({
                    where: { id: tx.escrowHold.id },
                    data: { status: 'REFUNDED', releasedAt: new Date() },
                });
            }
        }
        await (0, audit_1.logAuditEvent)({
            userId: req.user?.id,
            action: 'ADMIN_TRANSACTION_UPDATED',
            entityType: 'TRANSACTION',
            entityId: id,
            details: { oldStatus, newStatus: status, notes, releaseEscrow, refundBuyer },
        });
        res.json({
            success: true,
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateTransactionStatusAdmin = updateTransactionStatusAdmin;
// Admin: Control All Stores & Merchants across the Platform
const getStoresAdmin = async (req, res, next) => {
    try {
        const { search, isVerified, city } = req.query;
        const where = {};
        if (search) {
            where.OR = [
                { businessName: { contains: String(search) } },
                { phone: { contains: String(search) } },
                { owner: { fullName: { contains: String(search) } } },
            ];
        }
        if (isVerified !== undefined && isVerified !== 'ALL') {
            where.isVerified = isVerified === 'true';
        }
        if (city && city !== 'ALL') {
            where.city = String(city);
        }
        const stores = await db_1.default.businessProfile.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                owner: {
                    select: {
                        id: true,
                        fullName: true,
                        phoneNumber: true,
                        email: true,
                        isActive: true,
                        createdAt: true,
                    },
                },
                _count: {
                    select: {
                        listings: true,
                        branches: true,
                        employees: true,
                    },
                },
            },
        });
        const sellers = await db_1.default.sellerProfile.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        phoneNumber: true,
                        isActive: true,
                    },
                },
            },
            take: 50,
        });
        res.json({
            success: true,
            data: {
                stores,
                sellers,
            },
            meta: {
                totalStores: stores.length,
                totalSellers: sellers.length,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStoresAdmin = getStoresAdmin;
// Admin: Toggle Store Verification, Suspend/Activate, or Moderate Store
const updateStoreStatusAdmin = async (req, res, next) => {
    try {
        const rawId = String(req.params.id).trim();
        const cleanId = rawId.toLowerCase();
        const { isVerified, isActive, notes } = req.body;
        const store = await db_1.default.businessProfile.findFirst({
            where: {
                OR: [{ id: rawId }, { slug: rawId }, { slug: cleanId }],
            },
            include: { owner: true },
        });
        if (!store) {
            throw new errorHandler_1.AppError('Store not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        const updated = await db_1.default.businessProfile.update({
            where: { id: store.id },
            data: {
                ...(isVerified !== undefined ? { isVerified: !!isVerified } : {}),
            },
        });
        // Also update any pending verification requests for this store safely
        if (isVerified !== undefined) {
            try {
                await db_1.default.verificationRequest.updateMany({
                    where: {
                        targetId: store.id,
                        targetType: 'BUSINESS',
                        status: 'PENDING',
                    },
                    data: {
                        status: isVerified ? 'APPROVED' : 'REJECTED',
                        reviewedAt: new Date(),
                    },
                });
            }
            catch (verErr) {
                console.warn('[Store Status] Non-critical verification request update failed:', verErr?.message);
            }
            // CRITICAL: When admin verifies a store, all products (listings) of that store
            // MUST ALSO be verified and active so the public can see them immediately!
            try {
                if (isVerified) {
                    await db_1.default.listing.updateMany({
                        where: { businessId: store.id },
                        data: {
                            status: 'ACTIVE',
                            verificationStatus: 'VERIFIED',
                        },
                    });
                }
                else {
                    await db_1.default.listing.updateMany({
                        where: { businessId: store.id },
                        data: {
                            verificationStatus: 'UNVERIFIED',
                        },
                    });
                }
            }
            catch (listErr) {
                console.warn('[Store Status] Listing verification update failed:', listErr?.message);
            }
        }
        // If isActive is toggled, update owner active status (affecting login & visibility)
        if (isActive !== undefined && store.ownerId) {
            try {
                await db_1.default.user.update({
                    where: { id: store.ownerId },
                    data: { isActive: !!isActive },
                });
            }
            catch (userErr) {
                console.warn('[Store Status] Owner status update failed:', userErr?.message);
            }
        }
        try {
            await (0, audit_1.logAuditEvent)({
                userId: req.user?.id,
                action: 'ADMIN_STORE_UPDATED',
                entityType: 'BUSINESS_STORE',
                entityId: store.id,
                details: { storeName: store.businessName, isVerified, isActive, notes },
            });
        }
        catch { }
        res.json({
            success: true,
            data: updated,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateStoreStatusAdmin = updateStoreStatusAdmin;
// Admin: Permanently Delete a Store and Its Associated Data
const deleteStoreAdmin = async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const store = await db_1.default.businessProfile.findUnique({
            where: { id },
            include: { listings: { select: { id: true } } },
        });
        if (!store) {
            throw new errorHandler_1.AppError('Store not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        // 1. Delete associated verification requests
        await db_1.default.verificationRequest.deleteMany({
            where: {
                OR: [
                    { targetId: id },
                    { userId: store.ownerId, targetType: 'BUSINESS' },
                ],
            },
        });
        // 2. Cascade delete listings of this store
        await db_1.default.listing.deleteMany({
            where: { businessId: id },
        });
        // 3. Delete branches & employees
        await db_1.default.businessBranch.deleteMany({ where: { businessId: id } });
        await db_1.default.businessEmployee.deleteMany({ where: { businessId: id } });
        // 4. Delete the business profile
        await db_1.default.businessProfile.delete({ where: { id } });
        await (0, audit_1.logAuditEvent)({
            userId: req.user?.id,
            action: 'ADMIN_STORE_DELETED',
            entityType: 'BUSINESS_STORE',
            entityId: id,
            details: { storeName: store.businessName, slug: store.slug },
        });
        res.json({
            success: true,
            message: `Meheradda '${store.businessName}' si rasmi ah ayaa loo tirtiray.`,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteStoreAdmin = deleteStoreAdmin;
// Admin: Real-time Live Activity Across Systems (Web & App)
const getLiveActivityAdmin = async (req, res, next) => {
    try {
        const [recentTransactions, recentUsers, recentListings, recentLogs] = await Promise.all([
            db_1.default.marketplaceTransaction.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    buyer: { select: { fullName: true, phoneNumber: true } },
                    payments: { take: 1, select: { provider: true, status: true, amount: true } },
                },
            }),
            db_1.default.user.findMany({
                take: 8,
                orderBy: { createdAt: 'desc' },
                select: { id: true, fullName: true, phoneNumber: true, createdAt: true, city: true },
            }),
            db_1.default.listing.findMany({
                take: 8,
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true, price: true, currency: true, status: true, createdAt: true },
            }),
            db_1.default.auditLog.findMany({
                take: 12,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { fullName: true } } },
            }),
        ]);
        res.json({
            success: true,
            data: {
                recentTransactions,
                recentUsers,
                recentListings,
                recentLogs,
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getLiveActivityAdmin = getLiveActivityAdmin;
// Admin: Provision / Create New Admin Staff Account for Team Members
const createAdminUserAdmin = async (req, res, next) => {
    try {
        const { fullName, phoneNumber, email, password, roleName = 'SUPER_ADMIN', city = 'Garoowe' } = req.body;
        if (!fullName || !phoneNumber || !password) {
            throw new errorHandler_1.AppError('Full name, phone number, and password are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const existing = await db_1.default.user.findFirst({
            where: {
                OR: [
                    { phoneNumber },
                    ...(email ? [{ email }] : []),
                ],
            },
        });
        if (existing) {
            throw new errorHandler_1.AppError('A user with this phone or email already exists.', 409, types_1.ErrorCode.CONFLICT);
        }
        const bcrypt = await import('bcryptjs');
        const passwordHash = await bcrypt.hash(password, 10);
        const role = await db_1.default.role.findUnique({
            where: { name: roleName },
        });
        if (!role) {
            throw new errorHandler_1.AppError(`Role ${roleName} does not exist.`, 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const newUser = await db_1.default.user.create({
            data: {
                fullName,
                phoneNumber,
                email: email || null,
                passwordHash,
                city,
                verificationStatus: 'VERIFIED',
                isActive: true,
                wallet: {
                    create: { balance: 0.0, currency: 'USD' },
                },
                roles: {
                    create: { roleId: role.id },
                },
            },
            include: {
                roles: { select: { role: { select: { name: true } } } },
            },
        });
        await (0, audit_1.logAuditEvent)({
            userId: req.user?.id,
            action: 'ADMIN_ACCOUNT_CREATED',
            entityType: 'USER',
            entityId: newUser.id,
            details: { fullName, phoneNumber, roleName },
        });
        res.status(201).json({
            success: true,
            data: newUser,
            message: `Admin account for ${fullName} created successfully with role ${roleName}.`,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createAdminUserAdmin = createAdminUserAdmin;
// ─── ADMIN: Manage All Listings (No Store Required) ───────────────────────────
// Admin: Get ALL listings across platform (incl. drafts, archived)
const adminGetAllListings = async (req, res, next) => {
    try {
        const { page = '1', limit = '30', status, search, verticalType, categoryId } = req.query;
        const pageNum = parseInt(String(page), 10) || 1;
        const limitNum = parseInt(String(limit), 10) || 30;
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (status && status !== 'ALL')
            where.status = String(status);
        if (verticalType && verticalType !== 'ALL')
            where.verticalType = String(verticalType);
        if (categoryId)
            where.categoryId = String(categoryId);
        if (search) {
            where.OR = [
                { title: { contains: String(search) } },
                { seller: { fullName: { contains: String(search) } } },
                { seller: { phoneNumber: { contains: String(search) } } },
            ];
        }
        const [total, listings] = await Promise.all([
            db_1.default.listing.count({ where }),
            db_1.default.listing.findMany({
                where,
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: {
                    media: { take: 1, orderBy: { sortOrder: 'asc' } },
                    category: { select: { id: true, name: true, slug: true, verticalType: true } },
                    seller: { select: { id: true, fullName: true, phoneNumber: true, avatarUrl: true } },
                    business: { select: { id: true, businessName: true, slug: true, logoUrl: true } },
                    _count: { select: { transactionItems: true, reviews: true, offers: true } },
                },
            }),
        ]);
        res.json({
            success: true,
            data: listings,
            meta: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adminGetAllListings = adminGetAllListings;
// Admin: Create a listing directly (no store/seller profile needed — admin adds products)
const adminCreateListing = async (req, res, next) => {
    try {
        const { title, description, price, currency = 'USD', categoryId, verticalType = 'PRODUCT', condition = 'NEW', inventoryCount = 1, isNegotiable = false, city = 'Garoowe', region = 'Puntland', country = 'Somalia', district, neighborhood, landmark, businessId, mediaUrls = [], status = 'ACTIVE', } = req.body;
        if (!title || !description || price === undefined || !categoryId) {
            throw new errorHandler_1.AppError('Title, description, price, and categoryId are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const category = await db_1.default.category.findUnique({ where: { id: categoryId } });
        if (!category) {
            throw new errorHandler_1.AppError('Category not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        const adminUserId = req.user?.id;
        if (!adminUserId) {
            throw new errorHandler_1.AppError('Admin user ID not found in token.', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        // Generate unique slug
        const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const slug = `${baseSlug}-${Date.now()}`;
        const listing = await db_1.default.listing.create({
            data: {
                sellerId: adminUserId,
                businessId: businessId || null,
                categoryId,
                verticalType,
                title: title.trim(),
                slug,
                description: description.trim(),
                price: parseFloat(String(price)),
                currency,
                condition,
                inventoryCount: parseInt(String(inventoryCount), 10),
                isNegotiable: !!isNegotiable,
                city,
                region,
                country,
                district: district || null,
                neighborhood: neighborhood || null,
                landmark: landmark || null,
                status,
                verificationStatus: 'VERIFIED', // Admin listings auto-verified
                media: {
                    create: mediaUrls.map((url, idx) => ({
                        url,
                        mediaType: 'IMAGE',
                        sortOrder: idx,
                    })),
                },
            },
            include: {
                media: true,
                category: { select: { id: true, name: true, slug: true } },
                seller: { select: { id: true, fullName: true, phoneNumber: true } },
            },
        });
        await (0, audit_1.logAuditEvent)({
            userId: adminUserId,
            action: 'ADMIN_LISTING_CREATED',
            entityType: 'LISTING',
            entityId: listing.id,
            details: { title, price, categoryId, verticalType },
        });
        res.status(201).json({
            success: true,
            data: listing,
            message: `Alaabta "${title}" si guul leh ayaa loogu daray platform-ka.`,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adminCreateListing = adminCreateListing;
// Admin: Update a listing
const adminUpdateListing = async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const { title, description, price, status, inventoryCount, isNegotiable, city, landmark, mediaUrls } = req.body;
        const existing = await db_1.default.listing.findUnique({ where: { id } });
        if (!existing)
            throw new errorHandler_1.AppError('Listing not found.', 404, types_1.ErrorCode.NOT_FOUND);
        const updateData = {};
        if (title)
            updateData.title = title.trim();
        if (description)
            updateData.description = description.trim();
        if (price !== undefined)
            updateData.price = parseFloat(String(price));
        if (status)
            updateData.status = status;
        if (inventoryCount !== undefined)
            updateData.inventoryCount = parseInt(String(inventoryCount), 10);
        if (isNegotiable !== undefined)
            updateData.isNegotiable = !!isNegotiable;
        if (city)
            updateData.city = city;
        if (landmark)
            updateData.landmark = landmark;
        const updated = await db_1.default.listing.update({
            where: { id },
            data: updateData,
            include: {
                media: true,
                category: { select: { id: true, name: true, slug: true } },
            },
        });
        // Update media if provided
        if (mediaUrls && Array.isArray(mediaUrls) && mediaUrls.length > 0) {
            await db_1.default.listingMedia.deleteMany({ where: { listingId: id } });
            await db_1.default.listingMedia.createMany({
                data: mediaUrls.map((url, idx) => ({
                    listingId: id,
                    url,
                    mediaType: 'IMAGE',
                    sortOrder: idx,
                })),
            });
        }
        await (0, audit_1.logAuditEvent)({
            userId: req.user?.id,
            action: 'ADMIN_LISTING_UPDATED',
            entityType: 'LISTING',
            entityId: id,
            details: { title, status, price },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.adminUpdateListing = adminUpdateListing;
// Admin: Permanently delete a listing
const adminDeleteListing = async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const existing = await db_1.default.listing.findUnique({ where: { id }, select: { id: true, title: true } });
        if (!existing)
            throw new errorHandler_1.AppError('Listing not found.', 404, types_1.ErrorCode.NOT_FOUND);
        // Delete in correct FK order
        await db_1.default.listingAttributeValue.deleteMany({ where: { listingId: id } });
        await db_1.default.listingMedia.deleteMany({ where: { listingId: id } });
        await db_1.default.productVariant.deleteMany({ where: { listingId: id } });
        await db_1.default.stockMovement.deleteMany({ where: { listingId: id } });
        await db_1.default.vehicleDetail.deleteMany({ where: { listingId: id } });
        await db_1.default.propertyDetail.deleteMany({ where: { listingId: id } });
        await db_1.default.serviceDetail.deleteMany({ where: { listingId: id } });
        await db_1.default.linkedListing.deleteMany({ where: { listingId: id } });
        await db_1.default.offer.deleteMany({ where: { listingId: id } });
        await db_1.default.listing.delete({ where: { id } });
        await (0, audit_1.logAuditEvent)({
            userId: req.user?.id,
            action: 'ADMIN_LISTING_DELETED',
            entityType: 'LISTING',
            entityId: id,
            details: { title: existing.title },
        });
        res.json({ success: true, message: `Alaabta "${existing.title}" si buuxda waa la tirtiray.` });
    }
    catch (error) {
        next(error);
    }
};
exports.adminDeleteListing = adminDeleteListing;
// ─── ADMIN: Category Management ───────────────────────────────────────────────
// Admin: Get all categories (including inactive)
const adminGetCategories = async (req, res, next) => {
    try {
        let categories = [];
        try {
            categories = await db_1.default.category.findMany({
                orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
                include: {
                    _count: { select: { listings: true, subcategories: true } },
                    parent: { select: { id: true, name: true } },
                },
            });
        }
        catch (catErr) {
            console.warn('[Admin Categories] Could not fetch categories from DB:', catErr?.message);
            categories = [];
        }
        res.json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
};
exports.adminGetCategories = adminGetCategories;
// Admin: Create a new category
const adminCreateCategory = async (req, res, next) => {
    try {
        const { name, slug, description, icon, imageUrl, verticalType = 'PRODUCT', parentId, commissionRate = 5.0, displayOrder = 0 } = req.body;
        if (!name || !slug) {
            throw new errorHandler_1.AppError('Name and slug are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const existing = await db_1.default.category.findUnique({ where: { slug } });
        if (existing)
            throw new errorHandler_1.AppError(`Slug "${slug}" is already taken.`, 409, types_1.ErrorCode.CONFLICT);
        const category = await db_1.default.category.create({
            data: {
                name: name.trim(),
                slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                description: description || null,
                icon: icon || null,
                imageUrl: imageUrl || null,
                verticalType,
                parentId: parentId || null,
                commissionRate: parseFloat(String(commissionRate)),
                displayOrder: parseInt(String(displayOrder), 10),
                isActive: true,
                status: 'ACTIVE',
            },
        });
        await (0, audit_1.logAuditEvent)({
            userId: req.user?.id,
            action: 'ADMIN_CATEGORY_CREATED',
            entityType: 'CATEGORY',
            entityId: category.id,
            details: { name, slug, verticalType },
        });
        res.status(201).json({ success: true, data: category, message: `Qeybta "${name}" si guul leh waa la abuuray.` });
    }
    catch (error) {
        next(error);
    }
};
exports.adminCreateCategory = adminCreateCategory;
// Admin: Update category
const adminUpdateCategory = async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const { name, description, icon, imageUrl, isActive, status, commissionRate, displayOrder } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name.trim();
        if (description !== undefined)
            updateData.description = description;
        if (icon !== undefined)
            updateData.icon = icon;
        if (imageUrl !== undefined)
            updateData.imageUrl = imageUrl;
        if (isActive !== undefined)
            updateData.isActive = !!isActive;
        if (status)
            updateData.status = status;
        if (commissionRate !== undefined)
            updateData.commissionRate = parseFloat(String(commissionRate));
        if (displayOrder !== undefined)
            updateData.displayOrder = parseInt(String(displayOrder), 10);
        const updated = await db_1.default.category.update({ where: { id }, data: updateData });
        await (0, audit_1.logAuditEvent)({
            userId: req.user?.id,
            action: 'ADMIN_CATEGORY_UPDATED',
            entityType: 'CATEGORY',
            entityId: id,
            details: { name, isActive, status },
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.adminUpdateCategory = adminUpdateCategory;
// Admin: Delete a category (only if no listings)
const adminDeleteCategory = async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const cat = await db_1.default.category.findUnique({
            where: { id },
            include: { _count: { select: { listings: true } } },
        });
        if (!cat)
            throw new errorHandler_1.AppError('Category not found.', 404, types_1.ErrorCode.NOT_FOUND);
        if (cat._count.listings > 0) {
            throw new errorHandler_1.AppError(`Cannot delete: ${cat._count.listings} listings exist in this category. Archive them first.`, 400, types_1.ErrorCode.BAD_REQUEST);
        }
        await db_1.default.categoryAttribute.deleteMany({ where: { categoryId: id } });
        await db_1.default.category.delete({ where: { id } });
        await (0, audit_1.logAuditEvent)({
            userId: req.user?.id,
            action: 'ADMIN_CATEGORY_DELETED',
            entityType: 'CATEGORY',
            entityId: id,
            details: { name: cat.name },
        });
        res.json({ success: true, message: `Qeybta "${cat.name}" si buuxda waa la tirtiray.` });
    }
    catch (error) {
        next(error);
    }
};
exports.adminDeleteCategory = adminDeleteCategory;
// ─── ADMIN: System Wipe & Data Reset ─────────────────────────────────────────
// Admin: Clear all transactional data (keep users, categories, listings if desired)
const adminClearSystemData = async (req, res, next) => {
    try {
        const { clearType = 'TRANSACTIONS_ONLY', confirmPhrase } = req.body;
        if (confirmPhrase !== 'CONFIRM_CLEAR_DATA') {
            throw new errorHandler_1.AppError('Safety check failed. Send confirmPhrase: "CONFIRM_CLEAR_DATA"', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const results = {};
        if (clearType === 'TRANSACTIONS_ONLY' || clearType === 'FULL_WIPE') {
            // Clear all transaction-related data
            results.postComments = (await db_1.default.postComment.deleteMany({})).count;
            results.postLikes = (await db_1.default.postLike.deleteMany({})).count;
            results.socialPosts = (await db_1.default.socialPost.deleteMany({})).count;
            results.chatMessages = (await db_1.default.chatMessage.deleteMany({})).count;
            results.chatParticipants = (await db_1.default.chatParticipant.deleteMany({})).count;
            results.chatConversations = (await db_1.default.chatConversation.deleteMany({})).count;
            results.reviews = (await db_1.default.review.deleteMany({})).count;
            results.disputes = (await db_1.default.dispute.deleteMany({})).count;
            results.deliveryJobs = (await db_1.default.deliveryJob.deleteMany({})).count;
            results.paymentAttempts = (await db_1.default.paymentAttempt.deleteMany({})).count;
            results.payments = (await db_1.default.payment.deleteMany({})).count;
            results.paymentWebhooks = (await db_1.default.paymentWebhook.deleteMany({})).count;
            results.escrowHolds = (await db_1.default.escrowHold.deleteMany({})).count;
            results.ledgerEntries = (await db_1.default.ledgerEntry.deleteMany({})).count;
            results.payoutRequests = (await db_1.default.payoutRequest.deleteMany({})).count;
            results.txStatusHistory = (await db_1.default.transactionStatusHistory.deleteMany({})).count;
            results.txItems = (await db_1.default.transactionItem.deleteMany({})).count;
            results.transactions = (await db_1.default.marketplaceTransaction.deleteMany({})).count;
            results.offerHistory = (await db_1.default.offerHistory.deleteMany({})).count;
            results.offers = (await db_1.default.offer.deleteMany({})).count;
            results.buyerRequests = (await db_1.default.buyerRequest.deleteMany({})).count;
            results.wholesaleQuotes = (await db_1.default.wholesaleQuote.deleteMany({})).count;
            results.wholesaleRFQs = (await db_1.default.wholesaleRFQ.deleteMany({})).count;
            results.notifications = (await db_1.default.notification.deleteMany({})).count;
            results.verificationRequests = (await db_1.default.verificationRequest.deleteMany({})).count;
            results.auditLogs = (await db_1.default.auditLog.deleteMany({})).count;
            // Reset all wallet balances to 0
            await db_1.default.wallet.updateMany({ data: { balance: 0, pendingBalance: 0 } });
            results.walletsReset = await db_1.default.wallet.count();
        }
        if (clearType === 'FULL_WIPE') {
            // Also remove listings and stores
            results.stockMovements = (await db_1.default.stockMovement.deleteMany({})).count;
            results.listingMedia = (await db_1.default.listingMedia.deleteMany({})).count;
            results.listingAttrValues = (await db_1.default.listingAttributeValue.deleteMany({})).count;
            results.productVariants = (await db_1.default.productVariant.deleteMany({})).count;
            results.vehicleDetails = (await db_1.default.vehicleDetail.deleteMany({})).count;
            results.propertyDetails = (await db_1.default.propertyDetail.deleteMany({})).count;
            results.serviceDetails = (await db_1.default.serviceDetail.deleteMany({})).count;
            results.linkedListings = (await db_1.default.linkedListing.deleteMany({})).count;
            results.listings = (await db_1.default.listing.deleteMany({})).count;
            results.businessEmployees = (await db_1.default.businessEmployee.deleteMany({})).count;
            results.businessBranches = (await db_1.default.businessBranch.deleteMany({})).count;
            results.businessProfiles = (await db_1.default.businessProfile.deleteMany({})).count;
            results.sellerProfiles = (await db_1.default.sellerProfile.deleteMany({})).count;
            results.driverProfiles = (await db_1.default.driverProfile.deleteMany({})).count;
            // Remove all non-admin users
            const adminUsers = await db_1.default.userRole.findMany({
                where: { role: { name: { in: ['SUPER_ADMIN', 'FINANCE_ADMIN', 'MODERATOR', 'OPERATIONS_ADMIN'] } } },
                select: { userId: true },
            });
            const adminIds = adminUsers.map((u) => u.userId);
            await db_1.default.userRole.deleteMany({ where: { userId: { notIn: adminIds } } });
            results.usersDeleted = (await db_1.default.user.deleteMany({ where: { id: { notIn: adminIds } } })).count;
        }
        await (0, audit_1.logAuditEvent)({
            userId: req.user?.id,
            action: 'ADMIN_SYSTEM_DATA_CLEARED',
            entityType: 'SYSTEM',
            entityId: 'PLATFORM',
            details: { clearType, results },
        });
        res.json({
            success: true,
            message: `Nidaamka waa la nadiifiyay (${clearType}). Dhammaan xogta ku xusan ayaa la tirtiri.`,
            data: { clearType, results },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.adminClearSystemData = adminClearSystemData;
