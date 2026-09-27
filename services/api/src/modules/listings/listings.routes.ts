import { Router } from 'express';
import { getListings, getListingBySlug, createListing, updateListing, deleteListing } from './listings.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.get('/', getListings);
router.get('/:identifier', getListingBySlug);
router.post('/', authenticate, createListing);
router.patch('/:id', authenticate, updateListing);
router.delete('/:id', authenticate, deleteListing);

export default router;
