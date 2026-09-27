import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, ErrorCode } from '../types';
import { AppError } from './errorHandler';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, ErrorCode.UNAUTHORIZED));
    }

    const hasAllowedRole = req.user.roles.some((role) =>
      allowedRoles.includes(role) || role === 'SUPER_ADMIN'
    );

    if (!hasAllowedRole) {
      return next(
        new AppError(
          `Access forbidden. Required role: [${allowedRoles.join(', ')}]. Your roles: [${req.user.roles.join(', ')}]`,
          403,
          ErrorCode.FORBIDDEN
        )
      );
    }

    next();
  };
};

export const requireAdmin = requireRole(
  'SUPER_ADMIN',
  'FINANCE_ADMIN',
  'OPERATIONS_ADMIN',
  'MODERATOR',
  'SUPPORT_AGENT'
);

export const requireSeller = requireRole(
  'INDIVIDUAL_SELLER',
  'BUSINESS_SELLER',
  'SUPER_ADMIN'
);

export const requireDriver = requireRole('DRIVER', 'SUPER_ADMIN');
