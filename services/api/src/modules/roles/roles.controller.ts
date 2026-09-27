import { Request, Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// List All Platform Roles & Capabilities
export const listRoles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

// Request Role Activation (Customer -> Driver / Service Provider / Seller)
export const requestRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { roleName, notes } = req.body;

    if (!roleName) {
      throw new AppError('roleName is required', 400, ErrorCode.VALIDATION_ERROR);
    }

    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new AppError(`Role '${roleName}' does not exist.`, 404, ErrorCode.NOT_FOUND);
    }

    // Check if user already has this role
    const existing = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: req.user.id,
          roleId: role.id,
        },
      },
    });

    if (existing) {
      throw new AppError(`You already possess the role '${roleName}'.`, 409, ErrorCode.CONFLICT);
    }

    // For standard commercial roles (INDIVIDUAL_SELLER, WHOLESALE_BUYER, CREATOR), activate directly.
    // For specialized roles (DRIVER, SERVICE_PROVIDER, FINANCE_ADMIN), create pending verification or role.
    const autoGrantRoles = ['INDIVIDUAL_SELLER', 'WHOLESALE_BUYER', 'CREATOR'];

    if (autoGrantRoles.includes(roleName)) {
      await prisma.userRole.create({
        data: {
          userId: req.user.id,
          roleId: role.id,
        },
      });

      if (roleName === 'INDIVIDUAL_SELLER') {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        await prisma.sellerProfile.upsert({
          where: { userId: req.user.id },
          create: {
            userId: req.user.id,
            displayName: user?.fullName || 'Seller',
          },
          update: {},
        });
      }

      await logAuditEvent({
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
    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};

// Admin Role Assignment
export const assignRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { targetUserId, roleName } = req.body;

    if (!targetUserId || !roleName) {
      throw new AppError('targetUserId and roleName are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new AppError(`Role '${roleName}' does not exist.`, 404, ErrorCode.NOT_FOUND);
    }

    await prisma.userRole.upsert({
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

    await logAuditEvent({
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
  } catch (error) {
    next(error);
  }
};
