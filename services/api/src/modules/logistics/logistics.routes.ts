import { Router } from 'express';
import { updateDriverLocation, getAvailableJobs, acceptDeliveryJob, completeProofOfDelivery } from './logistics.controller';
import { authenticate } from '../../middleware/auth';
import { requireDriver } from '../../middleware/rbac';

const router = Router();

router.patch('/driver/location', authenticate, requireDriver, updateDriverLocation);
router.get('/jobs/available', authenticate, requireDriver, getAvailableJobs);
router.post('/jobs/:jobId/accept', authenticate, requireDriver, acceptDeliveryJob);
router.post('/jobs/:jobId/complete', authenticate, requireDriver, completeProofOfDelivery);

export default router;
