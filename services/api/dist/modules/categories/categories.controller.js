"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addCategoryAttribute = exports.approveCategory = exports.createCategory = exports.getCategoryBySlug = exports.getCategories = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const audit_1 = require("../../middleware/audit");
// List categories with optional hierarchy & vertical filter
const getCategories = async (req, res, next) => {
    try {
        const { verticalType, parentOnly, includePending, status } = req.query;
        const where = {};
        if (verticalType) {
            where.verticalType = String(verticalType).toUpperCase();
        }
        if (parentOnly === 'true') {
            where.parentId = null;
        }
        if (status) {
            where.status = String(status).toUpperCase();
        }
        else if (includePending !== 'true') {
            // By default show active categories
            where.status = 'ACTIVE';
        }
        let categories = [];
        try {
            categories = await db_1.default.category.findMany({
                where,
                orderBy: { displayOrder: 'asc' },
                include: {
                    subcategories: {
                        orderBy: { displayOrder: 'asc' },
                    },
                    attributes: true,
                },
            });
        }
        catch (dbErr) {
            console.warn('[Categories] Could not fetch from database, returning empty list:', dbErr.message);
            categories = [];
        }
        res.json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
// Get single category by ID or slug with its custom attributes
const getCategoryBySlug = async (req, res, next) => {
    try {
        const slug = String(req.params.slug);
        // Look up by slug or ID
        const category = await db_1.default.category.findFirst({
            where: {
                OR: [{ slug }, { id: slug }],
            },
            include: {
                subcategories: true,
                attributes: true,
            },
        });
        if (!category) {
            throw new errorHandler_1.AppError(`Category '${slug}' not found.`, 404, types_1.ErrorCode.NOT_FOUND);
        }
        res.json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategoryBySlug = getCategoryBySlug;
// User or Admin: Create Category
// When normal users or sellers add a category, it gets status: "WAIT" (Pending Approval).
// When admins add a category, it gets status: "ACTIVE".
const createCategory = async (req, res, next) => {
    try {
        const { name, slug, description, icon, imageUrl, verticalType, parentId, displayOrder, commissionRate } = req.body;
        if (!name || !name.trim()) {
            throw new errorHandler_1.AppError('Category name is required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
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
        while (await db_1.default.category.findUnique({ where: { slug: finalSlug } })) {
            finalSlug = `${candidateSlug}-${counter}`;
            counter++;
        }
        // Check if requester has admin role
        const userRoles = req.user?.roles || [];
        const isAdmin = userRoles.some((r) => ['SUPER_ADMIN', 'FINANCE_ADMIN', 'OPERATIONS_ADMIN', 'MODERATOR'].includes(r));
        // Categories added by users MUST wait (status: WAIT), while admin adds directly ACTIVE
        const initialStatus = isAdmin ? 'ACTIVE' : 'WAIT';
        const initialActive = isAdmin;
        const category = await db_1.default.category.create({
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
        await (0, audit_1.logAuditEvent)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.createCategory = createCategory;
// Admin: Approve a pending (WAIT) category
const approveCategory = async (req, res, next) => {
    try {
        const categoryId = String(req.params.categoryId);
        const category = await db_1.default.category.update({
            where: { id: categoryId },
            data: {
                status: 'ACTIVE',
                isActive: true,
            },
        });
        await (0, audit_1.logAuditEvent)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.approveCategory = approveCategory;
// Admin: Add or update custom attributes for a category
const addCategoryAttribute = async (req, res, next) => {
    try {
        const categoryId = String(req.params.categoryId);
        const { name, key, type, isRequired, options } = req.body;
        if (!name || !key) {
            throw new errorHandler_1.AppError('Attribute name and key are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const attribute = await db_1.default.categoryAttribute.upsert({
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
    }
    catch (error) {
        next(error);
    }
};
exports.addCategoryAttribute = addCategoryAttribute;
