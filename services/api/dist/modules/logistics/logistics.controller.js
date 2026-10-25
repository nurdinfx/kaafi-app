"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeProofOfDelivery = exports.acceptDeliveryJob = exports.getAvailableJobs = exports.updateDriverLocation = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const audit_1 = require("../../middleware/audit");
// Driver: Update Online Status & GPS Location
const updateDriverLocation = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { isOnline, latitude, longitude } = req.body;
        const driver = await db_1.default.driverProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!driver) {
            throw new errorHandler_1.AppError('Driver profile not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        const updated = await db_1.default.driverProfile.update({
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
    }
    catch (error) {
        next(error);
    }
};
exports.updateDriverLocation = updateDriverLocation;
// Driver: Get Available Delivery Jobs
const getAvailableJobs = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const jobs = await db_1.default.deliveryJob.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAvailableJobs = getAvailableJobs;
// Driver: Accept a Delivery Job
const acceptDeliveryJob = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const jobId = String(req.params.jobId);
        const driver = await db_1.default.driverProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!driver) {
            throw new errorHandler_1.AppError('Driver profile required to accept deliveries.', 403, types_1.ErrorCode.FORBIDDEN);
        }
        const job = await db_1.default.deliveryJob.findUnique({ where: { id: jobId } });
        if (!job || job.status !== 'SEARCHING_DRIVER') {
            throw new errorHandler_1.AppError('Delivery job is no longer available.', 400, types_1.ErrorCode.BAD_REQUEST);
        }
        const updatedJob = await db_1.default.deliveryJob.update({
            where: { id: jobId },
            data: {
                driverId: driver.id,
                status: 'ACCEPTED',
            },
        });
        await db_1.default.marketplaceTransaction.update({
            where: { id: job.transactionId },
            data: { status: 'ASSIGNED' },
        });
        res.json({
            success: true,
            data: updatedJob,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.acceptDeliveryJob = acceptDeliveryJob;
// Driver: Complete Delivery with Proof of Delivery PIN (Section 74)
const completeProofOfDelivery = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const jobId = String(req.params.jobId);
        const { deliveryPin, proofPhotoUrl } = req.body;
        if (!deliveryPin) {
            throw new errorHandler_1.AppError('Customer Proof of Delivery PIN is required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const job = await db_1.default.deliveryJob.findUnique({
            where: { id: jobId },
            include: { transaction: true },
        });
        if (!job) {
            throw new errorHandler_1.AppError('Delivery job not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        // Verify secret PIN buyer provided
        if (job.deliveryPin !== String(deliveryPin).trim()) {
            throw new errorHandler_1.AppError('Invalid Proof of Delivery PIN. Please confirm the PIN with the customer.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        // Mark job delivered
        const updatedJob = await db_1.default.deliveryJob.update({
            where: { id: jobId },
            data: {
                status: 'DELIVERED',
                deliveredAt: new Date(),
                proofPhotoUrl: proofPhotoUrl || null,
            },
        });
        // Complete transaction
        await db_1.default.marketplaceTransaction.update({
            where: { id: job.transactionId },
            data: { status: 'COMPLETED' },
        });
        // Credit driver wallet with delivery fee
        if (job.driverId) {
            const driver = await db_1.default.driverProfile.findUnique({ where: { id: job.driverId } });
            if (driver) {
                const driverWallet = await db_1.default.wallet.findUnique({ where: { userId: driver.userId } });
                if (driverWallet) {
                    const newBalance = parseFloat((driverWallet.balance + job.fee).toFixed(2));
                    await db_1.default.wallet.update({
                        where: { id: driverWallet.id },
                        data: { balance: newBalance },
                    });
                    await db_1.default.ledgerEntry.create({
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
        await (0, audit_1.logAuditEvent)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.completeProofOfDelivery = completeProofOfDelivery;
