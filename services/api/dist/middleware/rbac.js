"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireDriver = exports.requireSeller = exports.requireAdmin = exports.requireRole = void 0;
const types_1 = require("../types");
const errorHandler_1 = require("./errorHandler");
const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.AppError('Authentication required.', 401, types_1.ErrorCode.UNAUTHORIZED));
        }
        const hasAllowedRole = req.user.roles.some((role) => allowedRoles.includes(role) || role === 'SUPER_ADMIN');
        if (!hasAllowedRole) {
            return next(new errorHandler_1.AppError(`Access forbidden. Required role: [${allowedRoles.join(', ')}]. Your roles: [${req.user.roles.join(', ')}]`, 403, types_1.ErrorCode.FORBIDDEN));
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)('SUPER_ADMIN', 'FINANCE_ADMIN', 'OPERATIONS_ADMIN', 'MODERATOR', 'SUPPORT_AGENT');
exports.requireSeller = (0, exports.requireRole)('INDIVIDUAL_SELLER', 'BUSINESS_SELLER', 'SUPER_ADMIN');
exports.requireDriver = (0, exports.requireRole)('DRIVER', 'SUPER_ADMIN');
