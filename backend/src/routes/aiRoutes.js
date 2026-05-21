import express from "express";

import { chatRouter }
from "../api/chatRouter.js";

const router = express.Router();

router.post(
  "/chat",
  chatRouter
);

export default router;