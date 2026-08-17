import express from "express";

import { authMiddleware } from "../middleware/auth.middleware.js";

import { multerMiddleware } from "../config/cloudinaryConfig.js";
import { deleteMessage, getConversation, getMessages, markAsRead, sendMessage } from "../controllers/chat.controller.js";


const router=express.Router();


router.post('/send-message',authMiddleware,multerMiddleware,sendMessage);

//protected route
router.get('/conversations',authMiddleware,getConversation);
router.get('/conversations/:conversationId/messages',authMiddleware,getMessages);
router.put('/messages/read',authMiddleware,markAsRead);

router.delete('/messages/:messageId',authMiddleware,deleteMessage);

export default router;