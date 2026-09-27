import { Router } from 'express';
import { getFeed, createPost, toggleFollow, toggleLike } from './social.controller';
import { authenticate, optionalAuthenticate } from '../../middleware/auth';

const router = Router();

router.get('/feed', optionalAuthenticate, getFeed);
router.post('/posts', authenticate, createPost);
router.post('/follow/:targetUserId', authenticate, toggleFollow);
router.post('/posts/:postId/like', authenticate, toggleLike);

export default router;
