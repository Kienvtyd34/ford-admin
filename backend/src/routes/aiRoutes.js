import express from 'express';
import { handleChatInteraction } from '../controllers/chatController.js';

const router = express.Router();

// Định nghĩa tuyến đường cho Chatbot API
router.post('/chat', handleChatInteraction);

export default router;