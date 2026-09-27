import { Router } from 'express';
import { getWholesaleRFQs, createWholesaleRFQ, submitQuote, acceptQuote } from './wholesale.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/rfq', getWholesaleRFQs);
router.post('/rfq', authenticate, createWholesaleRFQ);
router.post('/rfq/:rfqId/quotes', authenticate, submitQuote);
router.post('/quotes/:quoteId/accept', authenticate, acceptQuote);

export default router;
