import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} from './chat.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/conversations/:id/messages', getMessages);
router.post('/conversations/:id/messages', sendMessage);

export default router;
