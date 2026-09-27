import { Router } from 'express';
import { createOffer, counterOffer, acceptOffer } from './offers.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/', authenticate, createOffer);
router.post('/:id/counter', authenticate, counterOffer);
router.post('/:id/accept', authenticate, acceptOffer);

export default router;
