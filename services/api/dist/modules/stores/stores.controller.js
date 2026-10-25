"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addStoreEmployee = exports.addStoreBranch = exports.createBusinessStore = exports.getAllStores = exports.getStoreBySlug = void 0;
const db_1 = __importDefault(require("../../db"));
const errorHandler_1 = require("../../middleware/errorHandler");
const types_1 = require("../../types");
const audit_1 = require("../../middleware/audit");
// Public: Get Store by slug or ID
const getStoreBySlug = async (req, res, next) => {
    try {
        const slug = String(req.params.slug);
        const store = await db_1.default.businessProfile.findFirst({
            where: {
                OR: [{ slug }, { id: slug }],
            },
            include: {
                owner: { select: { id: true, fullName: true, avatarUrl: true } },
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
            throw new errorHandler_1.AppError(`Store '${slug}' not found.`, 404, types_1.ErrorCode.NOT_FOUND);
        }
        res.json({
            success: true,
            data: {
                ...store,
                isPendingVerification: !store.isVerified,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStoreBySlug = getStoreBySlug;
// Public: Get all stores with verification filter
const getAllStores = async (req, res, next) => {
    try {
        const { search, city, verified, includeUnverified } = req.query;
        const where = {};
        // Default for public directory: only VERIFIED stores are public
        if (includeUnverified === 'true') {
            // allow all
        }
        else if (verified === 'false') {
            where.isVerified = false;
        }
        else if (verified === 'all') {
            // allow all
        }
        else {
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
        const stores = await db_1.default.businessProfile.findMany({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getAllStores = getAllStores;
// Create or Update Business Store with Pending Verification
const createBusinessStore = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new errorHandler_1.AppError('Unauthorized', 401, types_1.ErrorCode.UNAUTHORIZED);
        }
        const { businessName, slug: customSlug, tagline, description, logoUrl, coverImageUrl, phone, whatsappNumber, city = 'Garoowe', landmarkAddress, openingHours, licenseNumber, } = req.body;
        if (!businessName) {
            throw new errorHandler_1.AppError('Business name is required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const baseSlug = (customSlug || businessName)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const slug = `${baseSlug}-${Math.floor(100 + Math.random() * 900)}`;
        const store = await db_1.default.businessProfile.upsert({
            where: { ownerId: req.user.id },
            create: {
                ownerId: req.user.id,
                businessName,
                slug,
                tagline: tagline || null,
                description: description || null,
                logoUrl: logoUrl || null,
                coverImageUrl: coverImageUrl || null,
                phone: phone || req.user?.phoneNumber || '+252000000000',
                whatsappNumber: whatsappNumber || phone || req.user?.phoneNumber || null,
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
        const existingReq = await db_1.default.verificationRequest.findFirst({
            where: {
                targetId: store.id,
                targetType: 'BUSINESS',
                status: 'PENDING',
            },
        });
        if (!existingReq) {
            await db_1.default.verificationRequest.create({
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
        const businessRole = await db_1.default.role.findUnique({ where: { name: 'BUSINESS_SELLER' } });
        if (businessRole) {
            await db_1.default.userRole.upsert({
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
        await (0, audit_1.logAuditEvent)({
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
    }
    catch (error) {
        next(error);
    }
};
exports.createBusinessStore = createBusinessStore;
// Add Branch to Business Store
const addStoreBranch = async (req, res, next) => {
    try {
        const businessId = String(req.params.businessId);
        const { branchName, city = 'Garoowe', neighborhood, landmark, phone, latitude, longitude } = req.body;
        if (!branchName) {
            throw new errorHandler_1.AppError('Branch name is required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const branch = await db_1.default.businessBranch.create({
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
    }
    catch (error) {
        next(error);
    }
};
exports.addStoreBranch = addStoreBranch;
// Add Employee with Granular Permissions
const addStoreEmployee = async (req, res, next) => {
    try {
        const businessId = String(req.params.businessId);
        const { userId, roleTitle, permissions = [] } = req.body;
        if (!userId || !roleTitle) {
            throw new errorHandler_1.AppError('Target userId and roleTitle are required.', 400, types_1.ErrorCode.VALIDATION_ERROR);
        }
        const employee = await db_1.default.businessEmployee.upsert({
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
    }
    catch (error) {
        next(error);
    }
};
exports.addStoreEmployee = addStoreEmployee;
