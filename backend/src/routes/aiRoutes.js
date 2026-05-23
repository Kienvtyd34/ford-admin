import express from "express";

import { chatController } from "../controllers/chatbotController.js";

const router = express.Router();

router.post("/chat", chatController);

export default router;