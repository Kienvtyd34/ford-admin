import express from "express";

import { chatRouter }
from "../api/chatRouter.js";

const router = express.Router();

// ================= CHAT =================

router.post(
  "/chat",
  chatRouter
);

export default router;