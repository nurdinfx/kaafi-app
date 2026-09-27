import { Router } from 'express';
import {
  openDispute,
  submitSellerResponse,
  resolveDispute,
  getDisputes,
} from './disputes.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', openDispute);
router.patch('/:id/response', submitSellerResponse);
router.patch('/:id/resolve', resolveDispute);
router.get('/', getDisputes);

export default router;
