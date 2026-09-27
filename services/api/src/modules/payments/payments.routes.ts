import { Router } from 'express';
import { initiatePayment, handlePaymentWebhook, getMyWallet, requestPayout } from './payments.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Payment endpoints
router.post('/initiate', authenticate, initiatePayment);
router.post('/webhook/:provider', handlePaymentWebhook);

// Wallet & Payout endpoints
router.get('/wallet/me', authenticate, getMyWallet);
router.post('/wallet/payout', authenticate, requestPayout);

export default router;
