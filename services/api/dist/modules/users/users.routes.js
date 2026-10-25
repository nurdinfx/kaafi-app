"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Authenticated current user routes
router.get('/me', auth_1.authenticate, users_controller_1.getMe);
router.patch('/me', auth_1.authenticate, users_controller_1.updateMe);
// Notification endpoints
router.get('/notifications', auth_1.authenticate, users_controller_1.getMyNotifications);
router.patch('/notifications/read-all', auth_1.authenticate, users_controller_1.markAllNotificationsRead);
router.patch('/notifications/:id/read', auth_1.authenticate, users_controller_1.markNotificationRead);
// Public user profiles & listings
router.get('/:id', users_controller_1.getUserById);
router.get('/:id/listings', users_controller_1.getUserListings);
exports.default = router;
