import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createMyVehicle,
  deactivateMyVehicle,
  getMyVehicleById,
  getMyVehicles,
  updateMyVehicle,
} from "../controllers/customerVehicleController.js";

const router = express.Router();

router.use(protect);
router.get("/", getMyVehicles);
router.post("/", createMyVehicle);
router.get("/:id", getMyVehicleById);
router.patch("/:id", updateMyVehicle);
router.delete("/:id", deactivateMyVehicle);

export default router;
