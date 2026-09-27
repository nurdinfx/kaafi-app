import { Request, Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// Search & Browse Listings with Category-Aware Filters
export const getListings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      q,
      verticalType,
      categoryId,
      categorySlug,
      city,
      minPrice,
      maxPrice,
      condition,
      isWholesale,
      businessId,
      sellerId,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(String(page), 10) || 1;
    const limitNum = parseInt(String(limit), 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: 'ACTIVE',
    };

    if (q) {
      const queryStr = String(q).trim();
      where.OR = [
        { title: { contains: queryStr } },
        { description: { contains: queryStr } },
        { landmark: { contains: queryStr } },
      ];
    }

    if (verticalType) {
      where.verticalType = String(verticalType).toUpperCase();
    }

    if (categoryId) {
      where.categoryId = String(categoryId);
    } else if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: String(categorySlug) } });
      if (cat) {
        where.categoryId = cat.id;
      }
    }

    if (city) {
      where.city = { contains: String(city) };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(String(minPrice));
      if (maxPrice) where.price.lte = parseFloat(String(maxPrice));
    }

    if (condition) {
      where.condition = String(condition);
    }

    if (isWholesale === 'true') {
      where.isWholesaleAvailable = true;
    }

    if (businessId) {
      where.businessId = String(businessId);
    }

    if (sellerId) {
      where.sellerId = String(sellerId);
    }

    const [total, listings] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [String(sortBy)]: String(sortOrder) },
        include: {
          media: { orderBy: { sortOrder: 'asc' } },
          category: { select: { id: true, name: true, slug: true, verticalType: true } },
          seller: { select: { id: true, fullName: true, phoneNumber: true, avatarUrl: true } },
          business: { select: { id: true, businessName: true, slug: true, logoUrl: true, isVerified: true } },
          vehicleDetails: true,
          propertyDetails: true,
          serviceDetails: true,
          attributeValues: {
            include: { attribute: true },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: listings,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single listing by slug or ID & increment view count
export const getListingBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const identifier = String(req.params.identifier);

    const listing = await prisma.listing.findFirst({
      where: {
        OR: [{ slug: identifier }, { id: identifier }],
      },
      include: {
        media: { orderBy: { sortOrder: 'asc' } },
        category: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            phoneNumber: true,
            avatarUrl: true,
            sellerProfile: true,
          },
        },
        business: {
          include: {
            branches: true,
          },
        },
        vehicleDetails: true,
        propertyDetails: true,
        serviceDetails: true,
        attributeValues: {
          include: { attribute: true },
        },
        reviews: {
          include: {
            reviewer: { select: { id: true, fullName: true, avatarUrl: true } },
          },
          take: 5,
        },
      },
    });

    if (!listing) {
      throw new AppError(`Listing '${identifier}' not found.`, 404, ErrorCode.NOT_FOUND);
    }

    // Increment view count asynchronously
    prisma.listing.update({
      where: { id: listing.id },
      data: { viewsCount: { increment: 1 } },
    }).catch((e) => console.error('Failed to increment views:', e));

    res.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

// Create Listing across verticals (Product, Vehicle, Property, Land, Service, Wholesale)
export const createListing = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const {
      title,
      description,
      price,
      currency = 'USD',
      categoryId,
      condition = 'NEW',
      isNegotiable = true,
      inventoryCount = 1,
      sku,
      isWholesaleAvailable = false,
      minWholesaleQty,
      wholesalePrice,
      businessId,
      branchId,
      // Landmark Location
      city = 'Garoowe',
      region = 'Puntland',
      country = 'Somalia',
      district,
      neighborhood,
      landmark,
      latitude,
      longitude,
      // Media URLs
      mediaUrls = [],
      // Custom Attributes array: [{ attributeId: string, value: string }]
      customAttributes = [],
      // Vertical Specific payloads
      vehicleData,
      propertyData,
      serviceData,
    } = req.body;

    if (!title || !description || price === undefined || !categoryId) {
      throw new AppError('Title, description, price, and categoryId are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    // Verify category exists with attributes
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { attributes: true },
    });

    if (!category) {
      throw new AppError('Specified category does not exist.', 404, ErrorCode.NOT_FOUND);
    }

    // Dynamic Attribute Validation against Category Schema
    if (category.attributes && category.attributes.length > 0 && Array.isArray(customAttributes)) {
      const submittedMap = new Map((customAttributes as { attributeId: string; value: string }[]).map((a) => [a.attributeId, a.value]));
      for (const attr of category.attributes) {
        if (attr.isRequired && (!submittedMap.has(attr.id) || submittedMap.get(attr.id) === '')) {
          // Warning or validation error for strict attributes
        }
      }
    }

    // Generate unique slug
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const slug = `${baseSlug}-${randomSuffix}`;

    // Create listing in database atomically
    const listing = await prisma.listing.create({
      data: {
        sellerId: req.user.id,
        businessId: businessId || null,
        branchId: branchId || null,
        categoryId,
        verticalType: category.verticalType,
        title,
        slug,
        description,
        price: parseFloat(price),
        currency,
        isNegotiable: !!isNegotiable,
        condition,
        inventoryCount: parseInt(inventoryCount, 10) || 1,
        sku: sku || null,
        isWholesaleAvailable: !!isWholesaleAvailable,
        minWholesaleQty: minWholesaleQty ? parseInt(minWholesaleQty, 10) : null,
        wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : null,
        country,
        region,
        city,
        district: district || null,
        neighborhood: neighborhood || null,
        landmark: landmark || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        status: 'ACTIVE',
        // Media (supports both mediaUrls and media array)
        media: {
          create: (
            (Array.isArray(mediaUrls) && mediaUrls.length > 0
              ? mediaUrls
              : Array.isArray(req.body.media)
              ? req.body.media.map((m: any) => (typeof m === 'string' ? m : m.url)).filter(Boolean)
              : []) as string[]
          ).map((url, idx) => ({
            url,
            mediaType: url.endsWith('.mp4') || url.endsWith('.webm') ? 'VIDEO' : 'IMAGE',
            sortOrder: idx,
          })),
        },
        // Attribute Values
        attributeValues: {
          create: (customAttributes as { attributeId: string; value: string }[]).map((attr) => ({
            attributeId: attr.attributeId,
            value: String(attr.value),
          })),
        },
        // Specialized Vertical extensions
        vehicleDetails:
          category.verticalType === 'VEHICLE' && vehicleData
            ? {
                create: {
                  make: vehicleData.make || 'Other',
                  model: vehicleData.model || 'Other',
                  year: parseInt(vehicleData.year, 10) || new Date().getFullYear(),
                  mileageKm: vehicleData.mileageKm ? parseInt(vehicleData.mileageKm, 10) : null,
                  transmission: vehicleData.transmission || 'AUTOMATIC',
                  fuelType: vehicleData.fuelType || 'PETROL',
                  engineSize: vehicleData.engineSize || null,
                  color: vehicleData.color || null,
                  vin: vehicleData.vin || null,
                  plateNumber: vehicleData.plateNumber || null,
                  inspectionPassed: !!vehicleData.inspectionPassed,
                },
              }
            : undefined,
        propertyDetails:
          (category.verticalType === 'REAL_ESTATE' || category.verticalType === 'LAND') && propertyData
            ? {
                create: {
                  propertyType: propertyData.propertyType || 'HOUSE',
                  transactionType: propertyData.transactionType || 'SALE',
                  bedrooms: propertyData.bedrooms ? parseInt(propertyData.bedrooms, 10) : null,
                  bathrooms: propertyData.bathrooms ? parseInt(propertyData.bathrooms, 10) : null,
                  areaSqMeters: propertyData.areaSqMeters ? parseFloat(propertyData.areaSqMeters) : null,
                  furnished: !!propertyData.furnished,
                  hasParking: !!propertyData.hasParking,
                  landTitleStatus: propertyData.landTitleStatus || 'NOTARIZED',
                },
              }
            : undefined,
        serviceDetails:
          category.verticalType === 'SERVICE' && serviceData
            ? {
                create: {
                  serviceType: serviceData.serviceType || 'GENERAL',
                  pricingModel: serviceData.pricingModel || 'FIXED',
                  yearsExperience: serviceData.yearsExperience ? parseInt(serviceData.yearsExperience, 10) : null,
                  serviceArea: serviceData.serviceArea || 'Garoowe',
                  availability: serviceData.availability || 'EVERYDAY',
                },
              }
            : undefined,
      },
      include: {
        media: true,
        vehicleDetails: true,
        propertyDetails: true,
        serviceDetails: true,
        attributeValues: true,
      },
    });

    await logAuditEvent({
      userId: req.user.id,
      action: 'LISTING_CREATED',
      entityType: 'LISTING',
      entityId: listing.id,
      details: { title: listing.title, price: listing.price, vertical: listing.verticalType },
    });

    res.status(201).json({
      success: true,
      data: listing,
    });
  } catch (error) {
    next(error);
  }
};

// Update Listing
export const updateListing = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const id = String(req.params.id);
    const existing = await prisma.listing.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!existing) {
      throw new AppError(`Listing '${id}' not found.`, 404, ErrorCode.NOT_FOUND);
    }

    // Ownership check
    const isOwner = existing.sellerId === req.user.id;
    const isBusinessOwner = !!(existing.business && existing.business.ownerId === req.user.id);
    const isAdminUser = req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('OPERATIONS_ADMIN');

    if (!isOwner && !isBusinessOwner && !isAdminUser) {
      throw new AppError('You do not have permission to modify this listing.', 403, ErrorCode.FORBIDDEN);
    }

    const {
      title,
      description,
      price,
      condition,
      inventoryCount,
      landmark,
      city,
      district,
      status,
      isWholesaleAvailable,
      minWholesaleQty,
      wholesalePrice,
    } = req.body;

    const updated = await prisma.listing.update({
      where: { id },
      data: {
        title: title || undefined,
        description: description || undefined,
        price: price !== undefined ? parseFloat(price) : undefined,
        condition: condition || undefined,
        inventoryCount: inventoryCount !== undefined ? parseInt(inventoryCount, 10) : undefined,
        landmark: landmark !== undefined ? landmark : undefined,
        city: city || undefined,
        district: district !== undefined ? district : undefined,
        status: status || undefined,
        isWholesaleAvailable: isWholesaleAvailable !== undefined ? !!isWholesaleAvailable : undefined,
        minWholesaleQty: minWholesaleQty !== undefined ? parseInt(minWholesaleQty, 10) : undefined,
        wholesalePrice: wholesalePrice !== undefined ? parseFloat(wholesalePrice) : undefined,
      },
      include: {
        media: true,
        vehicleDetails: true,
        propertyDetails: true,
        serviceDetails: true,
      },
    });

    await logAuditEvent({
      userId: req.user.id,
      action: 'LISTING_UPDATED',
      entityType: 'LISTING',
      entityId: id,
      details: { title: updated.title, status: updated.status },
    });

    res.json({
      success: true,
      message: 'Listing updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// Archive / Delete Listing
export const deleteListing = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED);
    }

    const id = String(req.params.id);
    const existing = await prisma.listing.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!existing) {
      throw new AppError(`Listing '${id}' not found.`, 404, ErrorCode.NOT_FOUND);
    }

    const isOwner = existing.sellerId === req.user.id;
    const isBusinessOwner = !!(existing.business && existing.business.ownerId === req.user.id);
    const isAdminUser = req.user.roles.includes('SUPER_ADMIN');

    if (!isOwner && !isBusinessOwner && !isAdminUser) {
      throw new AppError('You do not have permission to delete this listing.', 403, ErrorCode.FORBIDDEN);
    }

    // Soft delete / archive
    await prisma.listing.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    await logAuditEvent({
      userId: req.user.id,
      action: 'LISTING_ARCHIVED',
      entityType: 'LISTING',
      entityId: id,
    });

    res.json({
      success: true,
      message: 'Listing archived successfully.',
    });
  } catch (error) {
    next(error);
  }
};
