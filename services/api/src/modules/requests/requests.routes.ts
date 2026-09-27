import { Router } from 'express';
import { getBuyerRequests, createBuyerRequest, getRequestDetails } from './requests.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', getBuyerRequests);
router.get('/:id', getRequestDetails);
router.post('/', authenticate, createBuyerRequest);

export default router;
