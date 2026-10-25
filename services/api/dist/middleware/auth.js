"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthenticate = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const types_1 = require("../types");
const config_1 = require("../config");
const db_1 = __importDefault(require("../db"));
const errorHandler_1 = require("./errorHandler");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errorHandler_1.AppError('Authentication required. Missing or invalid Bearer token.', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, config_1.CONFIG.JWT_SECRET);
        }
        catch (err) {
            throw new errorHandler_1.AppError('Invalid or expired authentication token.', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        // Fetch user with their assigned roles and key profile IDs
        const user = await db_1.default.user.findUnique({
            where: { id: decoded.userId },
            include: {
                roles: {
                    include: {
                        role: true,
                    },
                },
                sellerProfile: { select: { id: true } },
                businessProfile: { select: { id: true } },
                driverProfile: { select: { id: true } },
            },
        });
        if (!user || !user.isActive) {
            throw new errorHandler_1.AppError('User account not found or deactivated.', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const roleNames = user.roles.map((r) => r.role.name);
        req.user = {
            id: user.id,
            phoneNumber: user.phoneNumber,
            email: user.email,
            fullName: user.fullName,
            roles: roleNames,
            sellerProfileId: user.sellerProfile?.id || null,
            businessProfileId: user.businessProfile?.id || null,
            driverProfileId: user.driverProfile?.id || null,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticate = authenticate;
const optionalAuthenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, config_1.CONFIG.JWT_SECRET);
        const user = await db_1.default.user.findUnique({
            where: { id: decoded.userId },
            include: {
                roles: { include: { role: true } },
                sellerProfile: { select: { id: true } },
                businessProfile: { select: { id: true } },
                driverProfile: { select: { id: true } },
            },
        });
        if (user && user.isActive) {
            req.user = {
                id: user.id,
                phoneNumber: user.phoneNumber,
                email: user.email,
                fullName: user.fullName,
                roles: user.roles.map((r) => r.role.name),
                sellerProfileId: user.sellerProfile?.id || null,
                businessProfileId: user.businessProfile?.id || null,
                driverProfileId: user.driverProfile?.id || null,
            };
        }
    }
    catch {
        // If token invalid in optional auth, proceed as unauthenticated guest
    }
    next();
};
exports.optionalAuthenticate = optionalAuthenticate;
