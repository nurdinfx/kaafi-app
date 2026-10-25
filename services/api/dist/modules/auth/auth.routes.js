"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.post('/send-otp', auth_controller_1.sendOtp);
router.post('/verify-otp', auth_controller_1.verifyOtp);
// Alias routes used by the web client
router.post('/otp/send', auth_controller_1.sendOtp);
router.post('/otp/verify', auth_controller_1.verifyOtp);
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.get('/me', auth_1.authenticate, auth_controller_1.getMe);
router.post('/upgrade-role', auth_1.authenticate, auth_controller_1.upgradeRole);
exports.default = router;
