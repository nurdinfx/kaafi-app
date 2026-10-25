"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roles_controller_1 = require("./roles.controller");
const auth_1 = require("../../middleware/auth");
const rbac_1 = require("../../middleware/rbac");
const router = (0, express_1.Router)();
// Public roles listing
router.get('/', roles_controller_1.listRoles);
// User role capability requests
router.post('/request', auth_1.authenticate, roles_controller_1.requestRole);
// Admin role assignment guard
router.post('/assign', auth_1.authenticate, rbac_1.requireAdmin, roles_controller_1.assignRole);
exports.default = router;
