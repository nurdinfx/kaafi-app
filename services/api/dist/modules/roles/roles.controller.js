"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRole = exports.requestRole = exports.listRoles = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const audit_1 = require("../../middleware/audit");
// List All Platform Roles & Capabilities
const listRoles = async (req, res, next) => {
    try {
        const roles = await db_1.default.role.findMany({
            orderBy: { name: 'asc' },
        });
        res.json({
            success: true,
            data: roles,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.listRoles = listRoles;
// Request Role Activation (Customer -> Driver / Service Provider / Seller)
const requestRole = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { roleName, notes } = req.body;
        if (!roleName) {
            throw new errorHandler_1.AppError('roleName is required', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const role = await db_1.default.role.findUnique({
            where: { name: roleName },
        });
        if (!role) {
            throw new errorHandler_1.AppError(`Role '${roleName}' does not exist.`, 404, types_1.ErrorCode.NOT_FOUND);
        }
        // Check if user already has this role
        const existing = await db_1.default.userRole.findUnique({
            where: {
                userId_roleId: {
                    userId: req.user.id,
                    roleId: role.id,
                },
            },
        });
        if (existing) {
            throw new errorHandler_1.AppError(`You already possess the role '${roleName}'.`, 409, types_1.ErrorCode.CONFLICT);
        }
        // For standard commercial roles (INDIVIDUAL_SELLER, WHOLESALE_BUYER, CREATOR), activate directly.
        // For specialized roles (DRIVER, SERVICE_PROVIDER, FINANCE_ADMIN), create pending verification or role.
        const autoGrantRoles = ['INDIVIDUAL_SELLER', 'WHOLESALE_BUYER', 'CREATOR'];
        if (autoGrantRoles.includes(roleName)) {
            await db_1.default.userRole.create({
                data: {
                    userId: req.user.id,
                    roleId: role.id,
                },
            });
            if (roleName === 'INDIVIDUAL_SELLER') {
                const user = await db_1.default.user.findUnique({ where: { id: req.user.id } });
                await db_1.default.sellerProfile.upsert({
                    where: { userId: req.user.id },
                    create: {
                        userId: req.user.id,
                        displayName: user?.fullName || 'Seller',
                    },
                    update: {},
                });
            }
            await (0, audit_1.logAuditEvent)({
                userId: req.user.id,
                action: 'ROLE_AUTO_GRANTED',
                entityType: 'ROLE',
                entityId: role.id,
                details: { roleName },
            });
            res.status(201).json({
                success: true,
                message: `Role '${roleName}' granted successfully.`,
                data: { roleName, status: 'ACTIVE' },
            });
            return;
        }
        // Otherwise record request for admin/operations verification
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'ROLE_REQUEST_SUBMITTED',
            entityType: 'ROLE',
            entityId: role.id,
            details: { roleName, notes },
        });
        res.status(202).json({
            success: true,
            message: `Role request for '${roleName}' submitted for verification.`,
            data: { roleName, status: 'PENDING_APPROVAL' },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.requestRole = requestRole;
// Admin Role Assignment
const assignRole = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { targetUserId, roleName } = req.body;
        if (!targetUserId || !roleName) {
            throw new errorHandler_1.AppError('targetUserId and roleName are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const role = await db_1.default.role.findUnique({
            where: { name: roleName },
        });
        if (!role) {
            throw new errorHandler_1.AppError(`Role '${roleName}' does not exist.`, 404, types_1.ErrorCode.NOT_FOUND);
        }
        await db_1.default.userRole.upsert({
            where: {
                userId_roleId: {
                    userId: targetUserId,
                    roleId: role.id,
                },
            },
            create: {
                userId: targetUserId,
                roleId: role.id,
            },
            update: {},
        });
        await (0, audit_1.logAuditEvent)({
            userId: req.user.id,
            action: 'ADMIN_ROLE_ASSIGNED',
            entityType: 'USER_ROLE',
            entityId: targetUserId,
            details: { assignedRole: roleName },
        });
        res.json({
            success: true,
            message: `Role '${roleName}' assigned to user '${targetUserId}'.`,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.assignRole = assignRole;
