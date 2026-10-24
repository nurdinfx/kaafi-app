import { Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// Real Platform Analytics (GMV, Commission, Users, Active Orders) - NO MOCK DATA
export const getPlatformAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [
      totalUsers,
      totalSellers,
      totalBusinesses,
      totalListings,
      totalTransactions,
      completedTransactions,
      auditLogsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.sellerProfile.count(),
      prisma.businessProfile.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.marketplaceTransaction.count(),
      prisma.marketplaceTransaction.findMany({
        where: { status: { in: ['COMPLETED', 'PAYMENT_CONFIRMED', 'DELIVERED'] } },
        select: { totalAmount: true, commissionAmount: true },
      }),
      prisma.auditLog.count(),
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
  } catch (error) {
    next(error);
  }
};

// Admin: Review & Approve Verification Request
export const reviewVerification = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status, rejectionReason } = req.body; // APPROVED or REJECTED

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      throw new AppError('Status must be APPROVED or REJECTED.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const verification = await prisma.verificationRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!verification) {
      throw new AppError('Verification request not found.', 404, ErrorCode.NOT_FOUND);
    }

    const updated = await prisma.verificationRequest.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason || 'Documentation insufficient' : null,
        reviewedAt: new Date(),
      },
    });

    // If approved, update target profile
    if (status === 'APPROVED') {
      await prisma.user.update({
        where: { id: verification.userId },
        data: { verificationStatus: 'VERIFIED' },
      });

      if (verification.targetType === 'SELLER') {
        await prisma.sellerProfile.updateMany({
          where: { userId: verification.userId },
          data: { isVerified: true },
        });
      } else if (verification.targetType === 'BUSINESS' && verification.targetId) {
        await prisma.businessProfile.update({
          where: { id: verification.targetId },
          data: { isVerified: true },
        });
      }
    }

    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};

// Admin: Process Payout Request
export const processPayout = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const payoutId = String(req.params.payoutId);
    const { status, adminNotes } = req.body; // COMPLETED or REJECTED

    if (!status || !['COMPLETED', 'FAILED'].includes(status)) {
      throw new AppError('Status must be COMPLETED or FAILED.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const payout = await prisma.payoutRequest.findUnique({
      where: { id: payoutId },
      include: { wallet: true },
    });

    if (!payout) {
      throw new AppError('Payout request not found.', 404, ErrorCode.NOT_FOUND);
    }

    if (payout.status !== 'REQUESTED') {
      throw new AppError(`Payout is already in ${payout.status} state.`, 400, ErrorCode.BAD_REQUEST);
    }

    const updatedPayout = await prisma.payoutRequest.update({
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
      await prisma.wallet.update({
        where: { id: payout.walletId },
        data: { balance: newBalance },
      });

      await prisma.ledgerEntry.create({
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

    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};

// Admin: View Append-Only Audit Logs
export const getAuditLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '50', action, entityType } = req.query;
    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (action) where.action = String(action);
    if (entityType) where.entityType = String(entityType);

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
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
  } catch (error) {
    next(error);
  }
};

// Admin: Query Users with Role & Status Filtering
export const getUsersAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role, search, page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
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
      prisma.user.count({ where }),
      prisma.user.findMany({
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
  } catch (error) {
    next(error);
  }
};

// Admin: Deactivate / Ban or Reactivate User (supports isActive and/or verificationStatus)
export const updateUserStatusAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { isActive, verificationStatus, reason } = req.body;

    // At least one field must be provided
    if (isActive === undefined && verificationStatus === undefined) {
      throw new AppError('At least one of isActive or verificationStatus is required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = !!isActive;
    if (verificationStatus !== undefined) updateData.verificationStatus = String(verificationStatus);

    const updated = await prisma.user.update({
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

    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};

// Admin: Moderate Listing (Archive, Activate, Verify)


export const moderateListingAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status, verificationStatus, moderationNotes } = req.body;

    const data: any = {};
    if (status) data.status = String(status);
    if (verificationStatus) data.verificationStatus = String(verificationStatus);

    const listing = await prisma.listing.update({
      where: { id },
      data,
    });

    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};

// Admin: Update Category Commission Rate
export const updateCategoryCommissionAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { commissionRate } = req.body;

    if (commissionRate === undefined || isNaN(parseFloat(commissionRate))) {
      throw new AppError('Valid commissionRate number is required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { commissionRate: parseFloat(commissionRate) },
    });

    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};

// Admin: Control All Transactions & Orders across App & Web
export const getTransactionsAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '30', status, paymentProvider, search, fulfillmentType } = req.query;
    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && status !== 'ALL') where.status = String(status);
    if (fulfillmentType && fulfillmentType !== 'ALL') where.fulfillmentType = String(fulfillmentType);
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
      prisma.marketplaceTransaction.count({ where }),
      prisma.marketplaceTransaction.findMany({
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
      prisma.marketplaceTransaction.aggregate({
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
  } catch (error) {
    next(error);
  }
};

// Admin: Update Transaction or Order Status & Escrow Release/Refund Controls
export const updateTransactionStatusAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status, notes, releaseEscrow, refundBuyer } = req.body;

    const tx = await prisma.marketplaceTransaction.findUnique({
      where: { id },
      include: {
        items: true,
        escrowHold: true,
        buyer: { include: { wallet: true } },
      },
    });

    if (!tx) {
      throw new AppError('Transaction not found.', 404, ErrorCode.NOT_FOUND);
    }

    const oldStatus = tx.status;
    const updateData: any = {};
    if (status) updateData.status = status;

    const updated = await prisma.marketplaceTransaction.update({
      where: { id },
      data: updateData,
    });

    // Record transition in TransactionStatusHistory
    await prisma.transactionStatusHistory.create({
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
        let sellerWallet = await prisma.wallet.findUnique({ where: { userId: sellerId } });
        if (!sellerWallet) {
          sellerWallet = await prisma.wallet.create({
            data: { userId: sellerId, balance: 0, pendingBalance: 0 },
          });
        }
        const netAmount = parseFloat((tx.subtotalAmount - tx.commissionAmount).toFixed(2));
        const newBalance = parseFloat((sellerWallet.balance + netAmount).toFixed(2));
        await prisma.wallet.update({
          where: { id: sellerWallet.id },
          data: { balance: newBalance },
        });

        await prisma.ledgerEntry.create({
          data: {
            walletId: sellerWallet.id,
            type: 'CREDIT',
            amount: netAmount,
            balanceAfter: newBalance,
            reference: `ESCROW-REL-${tx.transactionNumber}`,
            description: `Super Admin released escrow for #${tx.transactionNumber}`,
          },
        });

        await prisma.escrowHold.update({
          where: { id: tx.escrowHold.id },
          data: { status: 'RELEASED', releasedAt: new Date() },
        });
      }
    }

    // If refundBuyer is requested, refund total amount to buyer wallet
    if (refundBuyer && tx.buyerId) {
      let buyerWallet = await prisma.wallet.findUnique({ where: { userId: tx.buyerId } });
      if (!buyerWallet) {
        buyerWallet = await prisma.wallet.create({
          data: { userId: tx.buyerId, balance: 0, pendingBalance: 0 },
        });
      }
      const newBalance = parseFloat((buyerWallet.balance + tx.totalAmount).toFixed(2));
      await prisma.wallet.update({
        where: { id: buyerWallet.id },
        data: { balance: newBalance },
      });

      await prisma.ledgerEntry.create({
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
        await prisma.escrowHold.update({
          where: { id: tx.escrowHold.id },
          data: { status: 'REFUNDED', releasedAt: new Date() },
        });
      }
    }

    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};

// Admin: Control All Stores & Merchants across the Platform
export const getStoresAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, isVerified, city } = req.query;

    const where: any = {};
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

    const stores = await prisma.businessProfile.findMany({
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

    const sellers = await prisma.sellerProfile.findMany({
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
  } catch (error) {
    next(error);
  }
};

// Admin: Toggle Store Verification, Suspend/Activate, or Moderate Store
export const updateStoreStatusAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { isVerified, isActive, notes } = req.body;

    const store = await prisma.businessProfile.findUnique({
      where: { id },
      include: { owner: true },
    });

    if (!store) {
      throw new AppError('Store not found.', 404, ErrorCode.NOT_FOUND);
    }

    const updated = await prisma.businessProfile.update({
      where: { id },
      data: {
        ...(isVerified !== undefined ? { isVerified: !!isVerified } : {}),
      },
    });

    // Also update any pending verification requests for this store
    if (isVerified !== undefined) {
      await prisma.verificationRequest.updateMany({
        where: {
          targetId: id,
          targetType: 'BUSINESS',
          status: 'PENDING',
        },
        data: {
          status: isVerified ? 'APPROVED' : 'REJECTED',
          reviewedAt: new Date(),
        },
      });
    }

    // If isActive is toggled, update owner active status (affecting login & visibility)
    if (isActive !== undefined) {
      await prisma.user.update({
        where: { id: store.ownerId },
        data: { isActive: !!isActive },
      });
    }

    await logAuditEvent({
      userId: req.user?.id,
      action: 'ADMIN_STORE_UPDATED',
      entityType: 'BUSINESS_STORE',
      entityId: id,
      details: { storeName: store.businessName, isVerified, isActive, notes },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Real-time Live Activity Across Systems (Web & App)
export const getLiveActivityAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [recentTransactions, recentUsers, recentListings, recentLogs] = await Promise.all([
      prisma.marketplaceTransaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { fullName: true, phoneNumber: true } },
          payments: { take: 1, select: { provider: true, status: true, amount: true } },
        },
      }),
      prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: { id: true, fullName: true, phoneNumber: true, createdAt: true, city: true },
      }),
      prisma.listing.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, price: true, currency: true, status: true, createdAt: true },
      }),
      prisma.auditLog.findMany({
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
  } catch (error) {
    next(error);
  }
};

// Admin: Provision / Create New Admin Staff Account for Team Members
export const createAdminUserAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { fullName, phoneNumber, email, password, roleName = 'SUPER_ADMIN', city = 'Garoowe' } = req.body;

    if (!fullName || !phoneNumber || !password) {
      throw new AppError('Full name, phone number, and password are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existing) {
      throw new AppError('A user with this phone or email already exists.', 409, ErrorCode.CONFLICT);
    }

    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new AppError(`Role ${roleName} does not exist.`, 400, ErrorCode.VALIDATION_ERROR);
    }

    const newUser = await prisma.user.create({
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

    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: Manage All Listings (No Store Required) ───────────────────────────

// Admin: Get ALL listings across platform (incl. drafts, archived)
export const adminGetAllListings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '30', status, search, verticalType, categoryId } = req.query;
    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 30;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && status !== 'ALL') where.status = String(status);
    if (verticalType && verticalType !== 'ALL') where.verticalType = String(verticalType);
    if (categoryId) where.categoryId = String(categoryId);
    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { seller: { fullName: { contains: String(search) } } },
        { seller: { phoneNumber: { contains: String(search) } } },
      ];
    }

    const [total, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
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
  } catch (error) {
    next(error);
  }
};

// Admin: Create a listing directly (no store/seller profile needed — admin adds products)
export const adminCreateListing = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      title,
      description,
      price,
      currency = 'USD',
      categoryId,
      verticalType = 'PRODUCT',
      condition = 'NEW',
      inventoryCount = 1,
      isNegotiable = false,
      city = 'Garoowe',
      region = 'Puntland',
      country = 'Somalia',
      district,
      neighborhood,
      landmark,
      mediaUrls = [],
      status = 'ACTIVE',
    } = req.body;

    if (!title || !description || price === undefined || !categoryId) {
      throw new AppError('Title, description, price, and categoryId are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new AppError('Category not found.', 404, ErrorCode.NOT_FOUND);
    }

    const adminUserId = req.user?.id;
    if (!adminUserId) {
      throw new AppError('Admin user ID not found in token.', 401, ErrorCode.UNAUTHORIZED);
    }

    // Generate unique slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const slug = `${baseSlug}-${Date.now()}`;

    const listing = await prisma.listing.create({
      data: {
        sellerId: adminUserId,
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
          create: (mediaUrls as string[]).map((url: string, idx: number) => ({
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

    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};

// Admin: Update a listing
export const adminUpdateListing = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { title, description, price, status, inventoryCount, isNegotiable, city, landmark, mediaUrls } = req.body;

    const existing = await prisma.listing.findUnique({ where: { id } });
    if (!existing) throw new AppError('Listing not found.', 404, ErrorCode.NOT_FOUND);

    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (description) updateData.description = description.trim();
    if (price !== undefined) updateData.price = parseFloat(String(price));
    if (status) updateData.status = status;
    if (inventoryCount !== undefined) updateData.inventoryCount = parseInt(String(inventoryCount), 10);
    if (isNegotiable !== undefined) updateData.isNegotiable = !!isNegotiable;
    if (city) updateData.city = city;
    if (landmark) updateData.landmark = landmark;

    const updated = await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        media: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    // Update media if provided
    if (mediaUrls && Array.isArray(mediaUrls) && mediaUrls.length > 0) {
      await prisma.listingMedia.deleteMany({ where: { listingId: id } });
      await prisma.listingMedia.createMany({
        data: mediaUrls.map((url: string, idx: number) => ({
          listingId: id,
          url,
          mediaType: 'IMAGE',
          sortOrder: idx,
        })),
      });
    }

    await logAuditEvent({
      userId: req.user?.id,
      action: 'ADMIN_LISTING_UPDATED',
      entityType: 'LISTING',
      entityId: id,
      details: { title, status, price },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// Admin: Permanently delete a listing
export const adminDeleteListing = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.listing.findUnique({ where: { id }, select: { id: true, title: true } });
    if (!existing) throw new AppError('Listing not found.', 404, ErrorCode.NOT_FOUND);

    // Delete in correct FK order
    await prisma.listingAttributeValue.deleteMany({ where: { listingId: id } });
    await prisma.listingMedia.deleteMany({ where: { listingId: id } });
    await prisma.productVariant.deleteMany({ where: { listingId: id } });
    await prisma.stockMovement.deleteMany({ where: { listingId: id } });
    await prisma.vehicleDetail.deleteMany({ where: { listingId: id } });
    await prisma.propertyDetail.deleteMany({ where: { listingId: id } });
    await prisma.serviceDetail.deleteMany({ where: { listingId: id } });
    await prisma.linkedListing.deleteMany({ where: { listingId: id } });
    await prisma.offer.deleteMany({ where: { listingId: id } });
    await prisma.listing.delete({ where: { id } });

    await logAuditEvent({
      userId: req.user?.id,
      action: 'ADMIN_LISTING_DELETED',
      entityType: 'LISTING',
      entityId: id,
      details: { title: existing.title },
    });

    res.json({ success: true, message: `Alaabta "${existing.title}" si buuxda waa la tirtiray.` });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: Category Management ───────────────────────────────────────────────

// Admin: Get all categories (including inactive)
export const adminGetCategories = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      include: {
        _count: { select: { listings: true, subcategories: true } },
        parent: { select: { id: true, name: true } },
      },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// Admin: Create a new category
export const adminCreateCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, slug, description, icon, imageUrl, verticalType = 'PRODUCT', parentId, commissionRate = 5.0, displayOrder = 0 } = req.body;

    if (!name || !slug) {
      throw new AppError('Name and slug are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) throw new AppError(`Slug "${slug}" is already taken.`, 409, ErrorCode.CONFLICT);

    const category = await prisma.category.create({
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

    await logAuditEvent({
      userId: req.user?.id,
      action: 'ADMIN_CATEGORY_CREATED',
      entityType: 'CATEGORY',
      entityId: category.id,
      details: { name, slug, verticalType },
    });

    res.status(201).json({ success: true, data: category, message: `Qeybta "${name}" si guul leh waa la abuuray.` });
  } catch (error) {
    next(error);
  }
};

// Admin: Update category
export const adminUpdateCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { name, description, icon, imageUrl, isActive, status, commissionRate, displayOrder } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isActive !== undefined) updateData.isActive = !!isActive;
    if (status) updateData.status = status;
    if (commissionRate !== undefined) updateData.commissionRate = parseFloat(String(commissionRate));
    if (displayOrder !== undefined) updateData.displayOrder = parseInt(String(displayOrder), 10);

    const updated = await prisma.category.update({ where: { id }, data: updateData });

    await logAuditEvent({
      userId: req.user?.id,
      action: 'ADMIN_CATEGORY_UPDATED',
      entityType: 'CATEGORY',
      entityId: id,
      details: { name, isActive, status },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete a category (only if no listings)
export const adminDeleteCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = String(req.params.id);

    const cat = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { listings: true } } },
    });
    if (!cat) throw new AppError('Category not found.', 404, ErrorCode.NOT_FOUND);

    if (cat._count.listings > 0) {
      throw new AppError(`Cannot delete: ${cat._count.listings} listings exist in this category. Archive them first.`, 400, ErrorCode.BAD_REQUEST);
    }

    await prisma.categoryAttribute.deleteMany({ where: { categoryId: id } });
    await prisma.category.delete({ where: { id } });

    await logAuditEvent({
      userId: req.user?.id,
      action: 'ADMIN_CATEGORY_DELETED',
      entityType: 'CATEGORY',
      entityId: id,
      details: { name: cat.name },
    });

    res.json({ success: true, message: `Qeybta "${cat.name}" si buuxda waa la tirtiray.` });
  } catch (error) {
    next(error);
  }
};

// ─── ADMIN: System Wipe & Data Reset ─────────────────────────────────────────

// Admin: Clear all transactional data (keep users, categories, listings if desired)
export const adminClearSystemData = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { clearType = 'TRANSACTIONS_ONLY', confirmPhrase } = req.body;

    if (confirmPhrase !== 'CONFIRM_CLEAR_DATA') {
      throw new AppError('Safety check failed. Send confirmPhrase: "CONFIRM_CLEAR_DATA"', 400, ErrorCode.VALIDATION_ERROR);
    }

    const results: Record<string, number> = {};

    if (clearType === 'TRANSACTIONS_ONLY' || clearType === 'FULL_WIPE') {
      // Clear all transaction-related data
      results.postComments = (await prisma.postComment.deleteMany({})).count;
      results.postLikes = (await prisma.postLike.deleteMany({})).count;
      results.socialPosts = (await prisma.socialPost.deleteMany({})).count;
      results.chatMessages = (await prisma.chatMessage.deleteMany({})).count;
      results.chatParticipants = (await prisma.chatParticipant.deleteMany({})).count;
      results.chatConversations = (await prisma.chatConversation.deleteMany({})).count;
      results.reviews = (await prisma.review.deleteMany({})).count;
      results.disputes = (await prisma.dispute.deleteMany({})).count;
      results.deliveryJobs = (await prisma.deliveryJob.deleteMany({})).count;
      results.paymentAttempts = (await prisma.paymentAttempt.deleteMany({})).count;
      results.payments = (await prisma.payment.deleteMany({})).count;
      results.paymentWebhooks = (await prisma.paymentWebhook.deleteMany({})).count;
      results.escrowHolds = (await prisma.escrowHold.deleteMany({})).count;
      results.ledgerEntries = (await prisma.ledgerEntry.deleteMany({})).count;
      results.payoutRequests = (await prisma.payoutRequest.deleteMany({})).count;
      results.txStatusHistory = (await prisma.transactionStatusHistory.deleteMany({})).count;
      results.txItems = (await prisma.transactionItem.deleteMany({})).count;
      results.transactions = (await prisma.marketplaceTransaction.deleteMany({})).count;
      results.offerHistory = (await prisma.offerHistory.deleteMany({})).count;
      results.offers = (await prisma.offer.deleteMany({})).count;
      results.buyerRequests = (await prisma.buyerRequest.deleteMany({})).count;
      results.wholesaleQuotes = (await prisma.wholesaleQuote.deleteMany({})).count;
      results.wholesaleRFQs = (await prisma.wholesaleRFQ.deleteMany({})).count;
      results.notifications = (await prisma.notification.deleteMany({})).count;
      results.verificationRequests = (await prisma.verificationRequest.deleteMany({})).count;
      results.auditLogs = (await prisma.auditLog.deleteMany({})).count;

      // Reset all wallet balances to 0
      await prisma.wallet.updateMany({ data: { balance: 0, pendingBalance: 0 } });
      results.walletsReset = await prisma.wallet.count();
    }

    if (clearType === 'FULL_WIPE') {
      // Also remove listings and stores
      results.stockMovements = (await prisma.stockMovement.deleteMany({})).count;
      results.listingMedia = (await prisma.listingMedia.deleteMany({})).count;
      results.listingAttrValues = (await prisma.listingAttributeValue.deleteMany({})).count;
      results.productVariants = (await prisma.productVariant.deleteMany({})).count;
      results.vehicleDetails = (await prisma.vehicleDetail.deleteMany({})).count;
      results.propertyDetails = (await prisma.propertyDetail.deleteMany({})).count;
      results.serviceDetails = (await prisma.serviceDetail.deleteMany({})).count;
      results.linkedListings = (await prisma.linkedListing.deleteMany({})).count;
      results.listings = (await prisma.listing.deleteMany({})).count;
      results.businessEmployees = (await prisma.businessEmployee.deleteMany({})).count;
      results.businessBranches = (await prisma.businessBranch.deleteMany({})).count;
      results.businessProfiles = (await prisma.businessProfile.deleteMany({})).count;
      results.sellerProfiles = (await prisma.sellerProfile.deleteMany({})).count;
      results.driverProfiles = (await prisma.driverProfile.deleteMany({})).count;

      // Remove all non-admin users
      const adminUsers = await prisma.userRole.findMany({
        where: { role: { name: { in: ['SUPER_ADMIN', 'FINANCE_ADMIN', 'MODERATOR', 'OPERATIONS_ADMIN'] } } },
        select: { userId: true },
      });
      const adminIds = adminUsers.map((u) => u.userId);

      await prisma.userRole.deleteMany({ where: { userId: { notIn: adminIds } } });
      results.usersDeleted = (await prisma.user.deleteMany({ where: { id: { notIn: adminIds } } })).count;
    }

    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};
