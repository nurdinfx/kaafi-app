import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AuthenticatedUser, ErrorCode } from '../types';
import { CONFIG } from '../config';
import prisma from '../db';
import { AppError } from './errorHandler';

interface JwtPayload {
  userId: string;
  phoneNumber: string;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing or invalid Bearer token.', 401, ErrorCode.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    let decoded: JwtPayload;

    try {
      decoded = jwt.verify(token, CONFIG.JWT_SECRET) as JwtPayload;
    } catch (err: any) {
      throw new AppError('Invalid or expired authentication token.', 401, ErrorCode.UNAUTHORIZED);
    }

    // Fetch user with their assigned roles and key profile IDs
    const user = await prisma.user.findUnique({
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
      throw new AppError('User account not found or deactivated.', 401, ErrorCode.UNAUTHORIZED);
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
  } catch (error) {
    next(error);
  }
};

export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
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
  } catch {
    // If token invalid in optional auth, proceed as unauthenticated guest
  }
  next();
};
