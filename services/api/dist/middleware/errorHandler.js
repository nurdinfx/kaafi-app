"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const types_1 = require("../types");
class AppError extends Error {
    statusCode;
    errorCode;
    details;
    constructor(message, statusCode = 400, errorCode = types_1.ErrorCode.BAD_REQUEST, details) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message || err);
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: {
                code: err.errorCode,
                message: err.message,
                details: err.details,
            },
        });
        return;
    }
    // Handle Prisma errors cleanly
    if (err.code === 'P2002') {
        res.status(409).json({
            success: false,
            message: 'A record with this unique constraint already exists.',
            error: {
                code: types_1.ErrorCode.CONFLICT,
                message: 'A record with this unique constraint already exists.',
                details: err.meta,
            },
        });
        return;
    }
    if (err.code === 'P2025') {
        res.status(404).json({
            success: false,
            message: 'The requested record was not found.',
            error: {
                code: types_1.ErrorCode.NOT_FOUND,
                message: 'The requested record was not found.',
            },
        });
        return;
    }
    // Fallback 500 error
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: {
            code: types_1.ErrorCode.INTERNAL_ERROR,
            message: err.message || 'Internal server error',
        },
    });
};
exports.errorHandler = errorHandler;
