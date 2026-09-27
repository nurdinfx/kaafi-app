import prisma from '../db';

export interface AuditParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress?: string;
  details?: Record<string, any>;
}

export const logAuditEvent = async (params: AuditParams): Promise<void> => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        ipAddress: params.ipAddress || null,
        details: params.details ? JSON.stringify(params.details) : null,
      },
    });
  } catch (error) {
    console.error('[AuditLog Error] Failed to write audit event:', error);
  }
};
