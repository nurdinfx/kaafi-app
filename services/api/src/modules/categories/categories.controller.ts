import { Request, Response, NextFunction } from 'express';
import prisma from '../../db';
import { AppError } from '../../middleware/errorHandler';
import { ErrorCode, AuthenticatedRequest } from '../../types';
import { logAuditEvent } from '../../middleware/audit';

// List categories with optional hierarchy & vertical filter
export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { verticalType, parentOnly } = req.query;

    const where: any = { isActive: true };
    if (verticalType) {
      where.verticalType = String(verticalType).toUpperCase();
    }
    if (parentOnly === 'true') {
      where.parentId = null;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        subcategories: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        attributes: true,
      },
    });

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

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        subcategories: true,
        attributes: true,
      },
    });

    if (!category) {
      throw new AppError(`Category with slug '${slug}' not found.`, 404, ErrorCode.NOT_FOUND);
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create Category
export const createCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, slug, description, icon, imageUrl, verticalType, parentId, displayOrder, commissionRate } = req.body;

    if (!name || !slug) {
      throw new AppError('Category name and slug are required.', 400, ErrorCode.VALIDATION_ERROR);
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        icon,
        imageUrl,
        verticalType: verticalType || 'PRODUCT',
        parentId: parentId || null,
        displayOrder: displayOrder || 0,
        commissionRate: commissionRate !== undefined ? commissionRate : 5.0,
      },
    });

    await logAuditEvent({
      userId: req.user?.id,
      action: 'CATEGORY_CREATED',
      entityType: 'CATEGORY',
      entityId: category.id,
      details: { name: category.name, verticalType: category.verticalType },
    });

    res.status(201).json({
      success: true,
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
