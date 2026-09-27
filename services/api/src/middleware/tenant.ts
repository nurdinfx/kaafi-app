import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ErrorCode } from '../types';
import { AppError } from './errorHandler';
import prisma from '../db';

export const requireBusinessOwnership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, ErrorCode.UNAUTHORIZED);
    }

    // Super Admin bypasses for administrative intervention
    if (req.user.roles.includes('SUPER_ADMIN')) {
      return next();
    }

    const businessIdParam = req.params.businessId || req.body.businessId || req.query.businessId;
    if (!businessIdParam) {
      throw new AppError('Business ID is required for this operation.', 400, ErrorCode.BAD_REQUEST);
    }

    // Check if user is owner of this business
    const business = await prisma.businessProfile.findUnique({
      where: { id: businessIdParam },
      select: { id: true, ownerId: true },
    });

    if (!business) {
      throw new AppError('Business profile not found.', 404, ErrorCode.NOT_FOUND);
    }

    if (business.ownerId === req.user.id) {
      return next();
    }

    // Check if user is an employee of this business
    const employee = await prisma.businessEmployee.findUnique({
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

    throw new AppError('Access denied: You do not have permission to manage this business.', 403, ErrorCode.FORBIDDEN);
  } catch (error) {
    next(error);
  }
};
