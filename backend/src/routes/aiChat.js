import { Router } from 'express';
import {
  createSession,
  getSessions,
  addMessage,
  getMessages,
  deleteSession,
} from '../Controllers/aiChatController.js';
import { authenticate, requireFarmAccess, requireSessionOwner } from '../utils/auth.js';

const router = Router({ mergeParams: true });

router.post('/sessions', authenticate, requireFarmAccess('task:read'), createSession);
router.get('/sessions', authenticate, requireFarmAccess('task:read'), getSessions);
router.post('/messages', authenticate, requireFarmAccess('task:read'), addMessage);
router.get('/messages/:sessionId', authenticate, requireSessionOwner, getMessages);
router.delete('/sessions/:sessionId', authenticate, requireSessionOwner, deleteSession);

export default router;
