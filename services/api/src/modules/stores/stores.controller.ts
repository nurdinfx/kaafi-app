import { Request, Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// Public: Get Store by slug or ID
export const getStoreBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = String(req.params.slug);

    const store = await prisma.businessProfile.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        owner: { select: { id: true, fullName: true, phoneNumber: true, email: true } },
        branches: { where: { isActive: true } },
        listings: {
          where: { status: 'ACTIVE' },
          include: {
            media: { take: 1 },
            category: { select: { id: true, name: true, slug: true } },
          },
          take: 50,
        },
      },
    });

    if (!store) {
      throw new AppError(`Store '${slug}' not found.`, 404, ErrorCode.NOT_FOUND);
    }

    res.json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// Create Business Store
export const createBusinessStore = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const {
      businessName,
      tagline,
      description,
      logoUrl,
      coverImageUrl,
      phone,
      whatsappNumber,
      city = 'Garoowe',
      landmarkAddress,
      openingHours,
      licenseNumber,
    } = req.body;

    if (!businessName || !phone) {
      throw new AppError('Business name and contact phone are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const baseSlug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;

    const store = await prisma.businessProfile.create({
      data: {
        ownerId: req.user.id,
        businessName,
        slug,
        tagline: tagline || null,
        description: description || null,
        logoUrl: logoUrl || null,
        coverImageUrl: coverImageUrl || null,
        phone,
        whatsappNumber: whatsappNumber || phone,
        city,
        landmarkAddress: landmarkAddress || null,
        openingHours: openingHours || 'Sat-Thu: 8:00 AM - 9:00 PM',
        licenseNumber: licenseNumber || null,
      },
    });

    // Ensure user has BUSINESS_SELLER role
    const businessRole = await prisma.role.findUnique({ where: { name: 'BUSINESS_SELLER' } });
    if (businessRole) {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: req.user.id,
            roleId: businessRole.id,
          },
        },
        create: {
          userId: req.user.id,
          roleId: businessRole.id,
        },
        update: {},
      });
    }

    await logAuditEvent({
      userId: req.user.id,
      action: 'STORE_CREATED',
      entityType: 'BUSINESS',
      entityId: store.id,
      details: { businessName: store.businessName, slug: store.slug },
    });

    res.status(201).json({
      success: true,
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

// Add Branch to Business Store
export const addStoreBranch = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = String(req.params.businessId);
    const { branchName, city = 'Garoowe', neighborhood, landmark, phone, latitude, longitude } = req.body;

    if (!branchName) {
      throw new AppError('Branch name is required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const branch = await prisma.businessBranch.create({
      data: {
        businessId,
        branchName,
        city,
        neighborhood: neighborhood || null,
        landmark: landmark || null,
        phone: phone || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    });

    res.status(201).json({
      success: true,
      data: branch,
    });
  } catch (error) {
    next(error);
  }
};

// Add Employee with Granular Permissions
export const addStoreEmployee = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const businessId = String(req.params.businessId);
    const { userId, roleTitle, permissions = [] } = req.body;

    if (!userId || !roleTitle) {
      throw new AppError('Target userId and roleTitle are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const employee = await prisma.businessEmployee.upsert({
      where: {
        businessId_userId: {
          businessId,
          userId,
        },
      },
      create: {
        businessId,
        userId,
        roleTitle,
        permissions: JSON.stringify(permissions),
      },
      update: {
        roleTitle,
        permissions: JSON.stringify(permissions),
      },
    });

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};
