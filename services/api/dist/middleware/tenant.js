"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireBusinessOwnership = void 0;
const types_1 = require("../types");
const errorHandler_1 = require("./errorHandler");
const db_1 = __importDefault(require("../db"));
const requireBusinessOwnership = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Authentication required.', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        // Super Admin bypasses for administrative intervention
        if (req.user.roles.includes('SUPER_ADMIN')) {
            return next();
        }
        const businessIdParam = req.params.businessId || req.body.businessId || req.query.businessId;
        if (!businessIdParam) {
            throw new errorHandler_1.AppError('Business ID is required for this operation.', 400, types_1.ErrorCode.BAD_REQUEST);
        }
        // Check if user is owner of this business
        const business = await db_1.default.businessProfile.findUnique({
            where: { id: businessIdParam },
            select: { id: true, ownerId: true },
        });
        if (!business) {
            throw new errorHandler_1.AppError('Business profile not found.', 404, types_1.ErrorCode.NOT_FOUND);
        }
        if (business.ownerId === req.user.id) {
            return next();
        }
        // Check if user is an employee of this business
        const employee = await db_1.default.businessEmployee.findUnique({
            where: {
                businessId_userId: {
                    businessId: businessIdParam,
                    userId: req.user.id,
                },
            },
        });
        if (employee) {
            return next();
        }
        throw new errorHandler_1.AppError('Access denied: You do not have permission to manage this business.', 403, types_1.ErrorCode.FORBIDDEN);
    }
    catch (error) {
        next(error);
    }
};
exports.requireBusinessOwnership = requireBusinessOwnership;
