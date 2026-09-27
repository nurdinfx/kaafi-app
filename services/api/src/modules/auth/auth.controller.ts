import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../db';
import { CONFIG } from '../../config';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// In-memory OTP store for phone verification (or Redis in multi-instance prod)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

export const sendOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) {
      throw new AppError('Phone number is required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    // Generate 6 digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(phoneNumber, { code, expiresAt });

    // In production, integrate with Somalia SMS gateway (Hormuud, Golis, Telesom).
    console.log(`[SMS Gateway / OTP] Sent OTP ${code} to ${phoneNumber}`);

    res.json({
      success: true,
      data: {
        message: 'OTP sent successfully to phone number.',
        // Expose code in development for easy testing
        devCode: process.env.NODE_ENV !== 'production' ? code : undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phoneNumber, code } = req.body;
    if (!phoneNumber || !code) {
      throw new AppError('Phone number and OTP code are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const stored = otpStore.get(phoneNumber);
    if (!stored || stored.expiresAt < Date.now() || stored.code !== code) {
      throw new AppError('Invalid or expired OTP code.', 400, ErrorCode.VALIDATION_ERROR);
    }

    otpStore.delete(phoneNumber);

    res.json({
      success: true,
      data: {
        verified: true,
        message: 'Phone number verified successfully.',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { phoneNumber, email, password, fullName, city, initialRole } = req.body;

    if (!phoneNumber || !password || !fullName) {
      throw new AppError('Phone number, full name, and password are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    // Check existing phone
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new AppError('An account with this phone number or email already exists.', 409, ErrorCode.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Determine roles
    const targetRoleName = initialRole || 'CUSTOMER';
    const roleRecord = await prisma.role.findUnique({
      where: { name: targetRoleName },
    });

    const user = await prisma.user.create({
      data: {
        phoneNumber,
        email: email || null,
        passwordHash,
        fullName,
        city: city || CONFIG.DEFAULT_CITY,
        country: CONFIG.DEFAULT_COUNTRY,
        roles: roleRecord
          ? {
              create: {
                roleId: roleRecord.id,
              },
            }
          : undefined,
        wallet: {
          create: {
            balance: 0.0,
            pendingBalance: 0.0,
            currency: 'USD',
          },
        },
      },
      include: {
        roles: { include: { role: true } },
        wallet: true,
      },
    });

    // Auto-create associated profiles based on initial role
    if (targetRoleName === 'INDIVIDUAL_SELLER') {
      await prisma.sellerProfile.create({
        data: {
          userId: user.id,
          displayName: user.fullName,
          city: user.city,
        },
      });
    } else if (targetRoleName === 'DRIVER') {
      await prisma.driverProfile.create({
        data: {
          userId: user.id,
          vehicleType: req.body.vehicleType || 'MOTORCYCLE',
          licenseNumber: req.body.licenseNumber || 'PENDING_VERIFICATION',
          city: user.city,
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      CONFIG.JWT_SECRET,
      { expiresIn: CONFIG.JWT_EXPIRES_IN as any }
    );

    await logAuditEvent({
      userId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: user.id,
      ipAddress: req.ip,
      details: { role: targetRoleName, city: user.city },
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email,
          fullName: user.fullName,
          city: user.city,
          roles: user.roles.map((r) => r.role.name),
          wallet: user.wallet,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { identifier, password } = req.body; // identifier can be phone or email

    if (!identifier || !password) {
      throw new AppError('Phone/email and password are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ phoneNumber: identifier }, { email: identifier }],
      },
      include: {
        roles: { include: { role: true } },
        sellerProfile: true,
        businessProfile: true,
        driverProfile: true,
        wallet: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid credentials.', 401, ErrorCode.INVALID_CREDENTIALS);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid credentials.', 401, ErrorCode.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new AppError('Account is disabled. Please contact support.', 403, ErrorCode.FORBIDDEN);
    }

    const token = jwt.sign(
      { userId: user.id, phoneNumber: user.phoneNumber },
      CONFIG.JWT_SECRET,
      { expiresIn: CONFIG.JWT_EXPIRES_IN as any }
    );

    await logAuditEvent({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phoneNumber: user.phoneNumber,
          email: user.email,
          fullName: user.fullName,
          city: user.city,
          avatarUrl: user.avatarUrl,
          roles: user.roles.map((r) => r.role.name),
          sellerProfile: user.sellerProfile,
          businessProfile: user.businessProfile,
          driverProfile: user.driverProfile,
          wallet: user.wallet,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        roles: { include: { role: true } },
        sellerProfile: true,
        businessProfile: {
          include: {
            branches: true,
            employees: true,
          },
        },
        driverProfile: true,
        wallet: true,
      },
    });

    if (!user) {
      throw new AppError('User not found.', 404, ErrorCode.NOT_FOUND);
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        city: user.city,
        country: user.country,
        roles: user.roles.map((r) => r.role.name),
        sellerProfile: user.sellerProfile,
        businessProfile: user.businessProfile,
        driverProfile: user.driverProfile,
        wallet: user.wallet,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const upgradeRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const { targetRole } = req.body;
    const allowedUpgrades = ['INDIVIDUAL_SELLER', 'BUSINESS_SELLER', 'CREATOR', 'SERVICE_PROVIDER', 'DRIVER', 'WHOLESALE_BUYER'];

    if (!targetRole || !allowedUpgrades.includes(targetRole)) {
      throw new AppError(`Invalid role upgrade. Allowed: ${allowedUpgrades.join(', ')}`, 400, ErrorCode.BAD_REQUEST);
    }

    const roleRecord = await prisma.role.findUnique({
      where: { name: targetRole },
    });

    if (!roleRecord) {
      throw new AppError('Role definition not found in database.', 404, ErrorCode.NOT_FOUND);
    }

    // Connect role to user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: req.user.id,
          roleId: roleRecord.id,
        },
      },
      create: {
        userId: req.user.id,
        roleId: roleRecord.id,
      },
      update: {},
    });

    // Create corresponding profiles if not yet present
    if (targetRole === 'INDIVIDUAL_SELLER') {
      await prisma.sellerProfile.upsert({
        where: { userId: req.user.id },
        create: {
          userId: req.user.id,
          displayName: req.user.fullName,
          city: CONFIG.DEFAULT_CITY,
        },
        update: {},
      });
    } else if (targetRole === 'DRIVER') {
      await prisma.driverProfile.upsert({
        where: { userId: req.user.id },
        create: {
          userId: req.user.id,
          vehicleType: req.body.vehicleType || 'MOTORCYCLE',
          licenseNumber: req.body.licenseNumber || 'PENDING',
          city: CONFIG.DEFAULT_CITY,
        },
        update: {},
      });
    }

    await logAuditEvent({
      userId: req.user.id,
      action: 'ROLE_UPGRADED',
      entityType: 'USER',
      entityId: req.user.id,
      details: { targetRole },
    });

    res.json({
      success: true,
      data: {
        message: `Account successfully upgraded with capability: ${targetRole}`,
      },
    });
  } catch (error) {
    next(error);
  }
};
