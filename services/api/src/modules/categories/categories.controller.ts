import { Request, Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// List categories with optional hierarchy & vertical filter
export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { verticalType, parentOnly, includePending, status } = req.query;

    const where: any = {};
    if (verticalType) {
      where.verticalType = String(verticalType).toUpperCase();
    }
    if (parentOnly === 'true') {
      where.parentId = null;
    }
    // Note: 'status' column may not exist in older DB schemas — we try with it first, fallback without
    if (status) {
      where.status = String(status).toUpperCase();
    } else if (includePending !== 'true') {
      where.status = 'ACTIVE';
    }

    let categories: any[] = [];
    try {
      categories = await prisma.category.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        include: {
          subcategories: {
            orderBy: { displayOrder: 'asc' },
          },
          attributes: true,
        },
      });
    } catch (dbErr: any) {
      // Fallback: production DB may not have 'status' column — retry without it
      console.warn('[Categories] Query with status filter failed, retrying without status filter:', dbErr.message);
      const whereWithoutStatus = { ...where };
      delete whereWithoutStatus.status;
      try {
        categories = await prisma.category.findMany({
          where: whereWithoutStatus,
          orderBy: { displayOrder: 'asc' },
          include: {
            subcategories: {
              orderBy: { displayOrder: 'asc' },
            },
            attributes: true,
          },
        });
      } catch (dbErr2: any) {
        console.warn('[Categories] Could not fetch from database, returning empty list:', dbErr2.message);
        categories = [];
      }
    }

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// Get single category by ID or slug with its custom attributes
export const getCategoryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const slug = String(req.params.slug);

    // Look up by slug or ID
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        subcategories: true,
        attributes: true,
      },
    });

    if (!category) {
      throw new AppError(`Category '${slug}' not found.`, 404, ErrorCode.NOT_FOUND);
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// User or Admin: Create Category
// When normal users or sellers add a category, it gets status: "WAIT" (Pending Approval).
// When admins add a category, it gets status: "ACTIVE".
export const createCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, slug, description, icon, imageUrl, verticalType, parentId, displayOrder, commissionRate } = req.body;

    if (!name || !name.trim()) {
      throw new AppError('Category name is required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const trimmedName = name.trim();

    // Auto-generate safe slug
    let candidateSlug = (slug || trimmedName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `category-${Date.now()}`;

    // Ensure unique slug to NEVER crash with 409 Conflict
    let finalSlug = candidateSlug;
    let counter = 1;
    while (await prisma.category.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${candidateSlug}-${counter}`;
      counter++;
    }

    // Check if requester has admin role
    const userRoles = req.user?.roles || [];
    const isAdmin = userRoles.some((r: string) =>
      ['SUPER_ADMIN', 'FINANCE_ADMIN', 'OPERATIONS_ADMIN', 'MODERATOR'].includes(r)
    );

    // Categories added by users MUST wait (status: WAIT), while admin adds directly ACTIVE
    const initialStatus = isAdmin ? 'ACTIVE' : 'WAIT';
    const initialActive = isAdmin;

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        slug: finalSlug,
        description: description || null,
        icon: icon || '📂',
        imageUrl: imageUrl || null,
        verticalType: verticalType || 'PRODUCT',
        parentId: parentId || null,
        displayOrder: displayOrder || 0,
        commissionRate: commissionRate !== undefined ? Number(commissionRate) : 5.0,
        status: initialStatus,
        isActive: initialActive,
      },
    });

    await logAuditEvent({
      userId: req.user?.id,
      action: 'CATEGORY_CREATED',
      entityType: 'CATEGORY',
      entityId: category.id,
      details: { name: category.name, verticalType: category.verticalType, status: initialStatus },
    });

    res.status(201).json({
      success: true,
      message: initialStatus === 'WAIT'
        ? 'Qaybta waa lagu daray waxayna ku jirtaa sugitaan (Status: WAIT / Pending Admin Approval).'
        : 'Category created successfully.',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Approve a pending (WAIT) category
export const approveCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categoryId = String(req.params.categoryId);

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        status: 'ACTIVE',
        isActive: true,
      },
    });

    await logAuditEvent({
      userId: req.user?.id,
      action: 'CATEGORY_APPROVED',
      entityType: 'CATEGORY',
      entityId: category.id,
      details: { name: category.name },
    });

    res.json({
      success: true,
      message: `Category "${category.name}" has been approved and activated.`,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Add or update custom attributes for a category
export const addCategoryAttribute = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categoryId = String(req.params.categoryId);
    const { name, key, type, isRequired, options } = req.body;

    if (!name || !key) {
      throw new AppError('Attribute name and key are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const attribute = await prisma.categoryAttribute.upsert({
      where: {
        categoryId_key: {
          categoryId,
          key,
        },
      },
      create: {
        categoryId,
        name,
        key,
        type: type || 'TEXT',
        isRequired: !!isRequired,
        options: options || null,
      },
      update: {
        name,
        type: type || 'TEXT',
        isRequired: !!isRequired,
        options: options || null,
      },
    });

    res.status(201).json({
      success: true,
      data: attribute,
    });
  } catch (error) {
    next(error);
  }
};
