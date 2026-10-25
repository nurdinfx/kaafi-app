"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeRole = exports.getMe = exports.login = exports.register = exports.verifyOtp = exports.sendOtp = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../../db"));
const config_1 = require("../../config");
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const audit_1 = require("../../middleware/audit");
// In-memory OTP store for phone verification (or Redis in multi-instance prod)
const otpStore = new Map();
const sendOtp = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;
        if (!phoneNumber) {
            throw new errorHandler_1.AppError('Phone number is required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        // Generate 6 digit OTP
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
        otpStore.set(phoneNumber, { code, expiresAt });
        // In production, integrate with Somalia SMS gateway (Hormuud, Golis, Telesom).
        console.log(`[SMS Gateway / OTP] Sent OTP ${code} to ${phoneNumber}`);
        res.json({
            success: true,
            data: {
                message: 'OTP sent successfully to phone number.',
                // Expose code in development for easy testing
                devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendOtp = sendOtp;
const verifyOtp = async (req, res, next) => {
    try {
        const { phoneNumber, code } = req.body;
        if (!phoneNumber || !code) {
            throw new errorHandler_1.AppError('Phone number and OTP code are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const stored = otpStore.get(phoneNumber);
        if (!stored || stored.expiresAt < Date.now() || stored.code !== code) {
            throw new errorHandler_1.AppError('Invalid or expired OTP code.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        otpStore.delete(phoneNumber);
        res.json({
            success: true,
            data: {
                verified: true,
                message: 'Phone number verified successfully.',
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyOtp = verifyOtp;
const register = async (req, res, next) => {
    try {
        const { phoneNumber, email, password, fullName, city, initialRole } = req.body;
        if (!phoneNumber || !password || !fullName) {
            throw new errorHandler_1.AppError('Phone number, full name, and password are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        // Check existing phone
        const existingUser = await db_1.default.user.findFirst({
            where: {
                OR: [
                    { phoneNumber },
                    ...(email ? [{ email }] : []),
                ],
            },
        });
        if (existingUser) {
            throw new errorHandler_1.AppError('An account with this phone number or email already exists.', 409, types_1.ErrorCode.CONFLICT);
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Determine roles
        const targetRoleName = initialRole || 'CUSTOMER';
        const roleRecord = await db_1.default.role.findUnique({
            where: { name: targetRoleName },
        });
        const user = await db_1.default.user.create({
            data: {
                phoneNumber,
                email: email || null,
                passwordHash,
                fullName,
                city: city || config_1.CONFIG.DEFAULT_CITY,
                country: config_1.CONFIG.DEFAULT_COUNTRY,
                roles: roleRecord
                    ? {
                        create: {
                            roleId: roleRecord.id,
                        },
                    }
                    : undefined,
                wallet: {
                    create: {
                        balance: 0.0,
                        pendingBalance: 0.0,
                        currency: 'USD',
                    },
                },
            },
            include: {
                roles: { include: { role: true } },
                wallet: true,
            },
        });
        // Auto-create associated profiles based on initial role
        if (targetRoleName === 'INDIVIDUAL_SELLER') {
            await db_1.default.sellerProfile.create({
                data: {
                    userId: user.id,
                    displayName: user.fullName,
                    city: user.city,
                },
            });
        }
        else if (targetRoleName === 'DRIVER') {
            await db_1.default.driverProfile.create({
                data: {
                    userId: user.id,
                    vehicleType: req.body.vehicleType || 'MOTORCYCLE',
                    licenseNumber: req.body.licenseNumber || 'PENDING_VERIFICATION',
                    city: user.city,
                },
            });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, phoneNumber: user.phoneNumber }, config_1.CONFIG.JWT_SECRET, { expiresIn: config_1.CONFIG.JWT_EXPIRES_IN });
        await (0, audit_1.logAuditEvent)({
            userId: user.id,
            action: 'USER_REGISTERED',
            entityType: 'USER',
            entityId: user.id,
            ipAddress: req.ip,
            details: { role: targetRoleName, city: user.city },
        });
        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    email: user.email,
                    fullName: user.fullName,
                    city: user.city,
                    roles: user.roles.map((r) => r.role.name),
                    wallet: user.wallet,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const identifier = req.body.identifier || req.body.phoneNumber || req.body.email;
        const password = req.body.password;
        if (!identifier || !password) {
            throw new errorHandler_1.AppError('Phone/email and password are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const user = await db_1.default.user.findFirst({
            where: {
                OR: [{ phoneNumber: identifier }, { email: identifier }],
            },
            include: {
                roles: { include: { role: true } },
                sellerProfile: true,
                businessProfile: true,
                driverProfile: true,
                wallet: true,
            },
        });
        if (!user) {
            throw new errorHandler_1.AppError('Invalid credentials.', 401, types_1.ErrorCode.INVALID_CREDENTIALS);
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new errorHandler_1.AppError('Invalid credentials.', 401, types_1.ErrorCode.INVALID_CREDENTIALS);
        }
        if (!user.isActive) {
            throw new errorHandler_1.AppError('Account is disabled. Please contact support.', 403, types_1.ErrorCode.FORBIDDEN);
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, phoneNumber: user.phoneNumber }, config_1.CONFIG.JWT_SECRET, { expiresIn: config_1.CONFIG.JWT_EXPIRES_IN });
        await (0, audit_1.logAuditEvent)({
            userId: user.id,
            action: 'USER_LOGIN',
            entityType: 'USER',
            entityId: user.id,
            ipAddress: req.ip,
        });
        res.json({
            success: true,
            data: {
                token,
                user: {
                    id: user.id,
                    phoneNumber: user.phoneNumber,
                    email: user.email,
                    fullName: user.fullName,
                    city: user.city,
                    avatarUrl: user.avatarUrl,
                    roles: user.roles.map((r) => r.role.name),
                    sellerProfile: user.sellerProfile,
                    businessProfile: user.businessProfile,
                    driverProfile: user.driverProfile,
                    wallet: user.wallet,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const user = await db_1.default.user.findUnique({
            where: { id: req.user.id },
            include: {
                roles: { include: { role: true } },
                sellerProfile: true,
                businessProfile: {
                    include: {
                        branches: true,
                        employees: true,
                    },
                },
                driverProfile: true,
                wallet: true,
            },
        });
        if (!user) {
            throw new errorHandler_1.AppError('User not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        res.json({
            success: true,
            data: {
                id: user.id,
                phoneNumber: user.phoneNumber,
                email: user.email,
                fullName: user.fullName,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
                city: user.city,
                country: user.country,
                roles: user.roles.map((r) => r.role.name),
                sellerProfile: user.sellerProfile,
                businessProfile: user.businessProfile,
                driverProfile: user.driverProfile,
                wallet: user.wallet,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
const upgradeRole = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { targetRole } = req.body;
        const allowedUpgrades = ['INDIVIDUAL_SELLER', 'BUSINESS_SELLER', 'CREATOR', 'SERVICE_PROVIDER', 'DRIVER', 'WHOLESALE_BUYER'];
        if (!targetRole || !allowedUpgrades.includes(targetRole)) {
            throw new errorHandler_1.AppError(`Invalid role upgrade. Allowed: ${allowedUpgrades.join(', ')}`, 400, types_1.ErrorCode.BAD_REQUEST);
        }
        const roleRecord = await db_1.default.role.findUnique({
            where: { name: targetRole },
        });
        if (!roleRecord) {
            throw new errorHandler_1.AppError('Role definition not found in database.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        // Connect role to user
        await db_1.default.userRole.upsert({
            where: {
                userId_roleId: {
                    userId: req.user.id,
                    roleId: roleRecord.id,
                },
            },
            create: {
                userId: req.user.id,
                roleId: roleRecord.id,
            },
            update: {},
        });
        // Create corresponding profiles if not yet present
        if (targetRole === 'INDIVIDUAL_SELLER') {
            await db_1.default.sellerProfile.upsert({
                where: { userId: req.user.id },
                create: {
                    userId: req.user.id,
                    displayName: req.user.fullName,
                    city: config_1.CONFIG.DEFAULT_CITY,
                },
                update: {},
            });
        }
        else if (targetRole === 'DRIVER') {
            await db_1.default.driverProfile.upsert({
                where: { userId: req.user.id },
                create: {
                    userId: req.user.id,
                    vehicleType: req.body.vehicleType || 'MOTORCYCLE',
                    licenseNumber: req.body.licenseNumber || 'PENDING',
                    city: config_1.CONFIG.DEFAULT_CITY,
                },
                update: {},
            });
        }
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'ROLE_UPGRADED',
            entityType: 'USER',
            entityId: req.user.id,
            details: { targetRole },
        });
        res.json({
            success: true,
            data: {
                message: `Account successfully upgraded with capability: ${targetRole}`,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.upgradeRole = upgradeRole;
