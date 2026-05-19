import express from "express";

import {
  chatbot
} from "../controllers/aiController.js";

const router = express.Router();

router.post(
  "/chat",
  chatbot
);

export default router;