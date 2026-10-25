"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditEvent = void 0;
const db_1 = __importDefault(require("../db"));
const logAuditEvent = async (params) => {
    try {
        await db_1.default.auditLog.create({
            data: {
                userId: params.userId || null,
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                ipAddress: params.ipAddress || null,
                details: params.details ? JSON.stringify(params.details) : null,
            },
        });
    }
    catch (error) {
        console.error('[AuditLog Error] Failed to write audit event:', error);
    }
};
exports.logAuditEvent = logAuditEvent;
