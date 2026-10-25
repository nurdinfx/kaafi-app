"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_controller_1 = require("./categories.controller");
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const router = (0, express_1.Router)();
router.get('/', categories_controller_1.getCategories);
router.get('/:slug', categories_controller_1.getCategoryBySlug);
// Authenticated users and admins can create categories (users get WAIT status, admins get ACTIVE)
router.post('/', auth_1.authenticate, categories_controller_1.createCategory);
router.patch('/:categoryId/approve', auth_1.authenticate, rbac_1.requireAdmin, categories_controller_1.approveCategory);
router.post('/:categoryId/attributes', auth_1.authenticate, rbac_1.requireAdmin, categories_controller_1.addCategoryAttribute);
exports.default = router;
