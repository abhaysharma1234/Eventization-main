import { Router } from 'express';
import { sendMessage, getChatHistory, clearChat } from '../controllers/chatbotController.js';

const router = Router();

// Public endpoints - anyone can chat
router.post('/message', sendMessage);
router.get('/history', getChatHistory);
router.delete('/clear', clearChat);

export default router;
