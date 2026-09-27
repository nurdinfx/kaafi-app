import { Router } from 'express';
import { createReview, openDispute, submitVerification } from './trust.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/reviews', authenticate, createReview);
router.post('/disputes', authenticate, openDispute);
router.post('/verification', authenticate, submitVerification);

export default router;
