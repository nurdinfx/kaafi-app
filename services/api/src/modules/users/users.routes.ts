import { Router } from 'express';
import {
  getMe,
  updateMe,
  getUserById,
  getUserListings,
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './users.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Authenticated current user routes
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateMe);

// Notification endpoints
router.get('/notifications', authenticate, getMyNotifications);
router.patch('/notifications/read-all', authenticate, markAllNotificationsRead);
router.patch('/notifications/:id/read', authenticate, markNotificationRead);

// Public user profiles & listings
router.get('/:id', getUserById);
router.get('/:id/listings', getUserListings);

export default router;
