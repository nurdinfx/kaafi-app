import { Router } from 'express';
import { createTransaction, updateTransactionStatus, getMyTransactions, getTransactionById } from './transactions.controller';
import { getMyWallet, requestPayout } from '../payments/payments.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Wallet aliases under transactions for frontend convenience
router.get('/wallet/me', authenticate, getMyWallet);
router.post('/wallet/payout', authenticate, requestPayout);

// Transaction endpoints
router.get('/', authenticate, getMyTransactions);
router.get('/:id', authenticate, getTransactionById);
router.post('/', authenticate, createTransaction);
router.patch('/:id/status', authenticate, updateTransactionStatus);

export default router;
