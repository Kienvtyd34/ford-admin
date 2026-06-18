import express from "express";
import {
  getIntents,
  getIntentById,
  createIntent,
  updateIntent,
  deleteIntent,
  toggleIntentStatus
} from "../controllers/intent.controller.js";

const router = express.Router();

// =========================
// CRUD INTENTS
// =========================

// GET all intents
router.get("/", getIntents);

// GET one intent
router.get("/:id", getIntentById);

// CREATE intent
router.post("/", createIntent);

// UPDATE intent
router.put("/:id", updateIntent);

// DELETE intent
router.delete("/:id", deleteIntent);

// TOGGLE active
router.patch("/:id/toggle", toggleIntentStatus);

export default router;