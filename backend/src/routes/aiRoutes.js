import express from "express";
import { chatController } from "../controllers/aiController.js";

const router = express.Router();

router.post("/", chatController);

export default router;