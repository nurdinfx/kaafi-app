import { Router } from 'express';
import { register, login, sendOtp, verifyOtp, getMe, upgradeRole } from './auth.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
// Alias routes used by the web client
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.post('/upgrade-role', authenticate, upgradeRole);

export default router;
