import { Router } from 'express';
import {
  createEscrowHold,
  releaseEscrowHold,
  getEscrowDetails,
} from './escrow.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/hold', createEscrowHold);
router.patch('/release/:transactionId', releaseEscrowHold);
router.get('/:transactionId', getEscrowDetails);

export default router;
