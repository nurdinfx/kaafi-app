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
        owner: { select: { id: true, fullName: true, phoneNumber: true, avatarUrl: true } },
        branches: { where: { isActive: true } },
        listings: {
          where: { status: 'ACTIVE' },
          include: {
            media: { take: 10, orderBy: { sortOrder: 'asc' } },
            category: { select: { id: true, name: true, slug: true } },
          },
          take: 100,
        },
      },
    });

    if (!store) {
      throw new AppError(`Store '${slug}' not found.`, 404, ErrorCode.NOT_FOUND);
    }

    res.json({
      success: true,
      data: {
        ...store,
        isPendingVerification: !store.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Public: Get all stores with verification filter
export const getAllStores = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, city, verified, includeUnverified } = req.query;

    const where: any = {};

    // Default for public directory: only VERIFIED stores are public
    if (includeUnverified === 'true') {
      // allow all
    } else if (verified === 'false') {
      where.isVerified = false;
    } else if (verified === 'all') {
      // allow all
    } else {
      where.isVerified = true;
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { businessName: { contains: q } },
        { tagline: { contains: q } },
        { description: { contains: q } },
      ];
    }

    if (city && city !== 'ALL') {
      where.city = { contains: String(city) };
    }

    const stores = await prisma.businessProfile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, fullName: true, phoneNumber: true, avatarUrl: true } },
        branches: { where: { isActive: true } },
        listings: {
          where: { status: 'ACTIVE' },
          include: {
            media: { take: 4, orderBy: { sortOrder: 'asc' } },
            category: { select: { id: true, name: true, slug: true } },
          },
          take: 50,
        },
        _count: {
          select: { listings: true },
        },
      },
    });

    res.json({
      success: true,
      data: stores,
    });
  } catch (error) {
    next(error);
  }
};

// Create or Update Business Store with Pending Verification
export const createBusinessStore = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const {
      businessName,
      slug: customSlug,
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

    if (!businessName) {
      throw new AppError('Business name is required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const baseSlug = (customSlug || businessName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `store-${Date.now()}`;

    // Check if user already has a store or if slug clashes
    const existingForOwner = await prisma.businessProfile.findUnique({
      where: { ownerId: req.user.id },
    });

    let slug = existingForOwner?.slug || baseSlug;
    if (!existingForOwner || (customSlug && existingForOwner.slug !== customSlug)) {
      const clash = await prisma.businessProfile.findFirst({
        where: {
          slug: baseSlug,
          NOT: { ownerId: req.user.id },
        },
      });
      slug = clash ? `${baseSlug}-${Math.floor(100 + Math.random() * 900)}` : baseSlug;
    }

    const store = await prisma.businessProfile.upsert({
      where: { ownerId: req.user.id },
      create: {
        ownerId: req.user.id,
        businessName,
        slug,
        tagline: tagline || null,
        description: description || null,
        logoUrl: logoUrl || null,
        coverImageUrl: coverImageUrl || null,
        phone: phone || (req.user as any)?.phoneNumber || '+252000000000',
        whatsappNumber: whatsappNumber || phone || (req.user as any)?.phoneNumber || null,
        city,
        landmarkAddress: landmarkAddress || null,
        openingHours: openingHours || 'Sat-Thu: 8:00 AM - 9:00 PM',
        licenseNumber: licenseNumber || null,
        isVerified: false, // Must wait for admin verification before becoming public
      },
      update: {
        businessName,
        tagline: tagline || undefined,
        description: description || undefined,
        logoUrl: logoUrl || undefined,
        coverImageUrl: coverImageUrl || undefined,
        phone: phone || undefined,
        whatsappNumber: whatsappNumber || undefined,
        city: city || undefined,
        landmarkAddress: landmarkAddress || undefined,
        openingHours: openingHours || undefined,
        licenseNumber: licenseNumber || undefined,
        // Keep verification pending upon updates until approved
      },
    });

    // Automatically trigger verification request for admin review
    const existingReq = await prisma.verificationRequest.findFirst({
      where: {
        targetId: store.id,
        targetType: 'BUSINESS',
        status: 'PENDING',
      },
    });

    if (!existingReq) {
      await prisma.verificationRequest.create({
        data: {
          userId: req.user.id,
          targetType: 'BUSINESS',
          targetId: store.id,
          documentType: 'BUSINESS_STORE',
          documentUrl: logoUrl || coverImageUrl || 'STORE_REQUEST',
          status: 'PENDING',
        },
      });
    }

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
      action: 'STORE_CREATED_PENDING_VERIFICATION',
      entityType: 'BUSINESS',
      entityId: store.id,
      details: { businessName: store.businessName, slug: store.slug, isVerified: false },
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
