import { Router } from 'express';
import {
  recordStockMovement,
  transferBranchStock,
  getListingStockMovements,
  getLowStockAlerts,
  createProductVariant,
} from './inventory.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All inventory endpoints require authentication
router.use(authenticate);

router.post('/movement', recordStockMovement);
router.post('/transfer', transferBranchStock);
router.get('/movements/:listingId', getListingStockMovements);
router.get('/alerts/low-stock', getLowStockAlerts);
router.post('/variants', createProductVariant);

export default router;
