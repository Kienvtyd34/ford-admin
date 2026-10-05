import express from "express";
import { admin, protect } from "../middleware/authMiddleware.js";
import {
  createServicePackage,
  deactivateServicePackage,
  getActiveServicePackages,
  getAllServicePackages,
  updateServicePackage,
} from "../controllers/servicePackageController.js";

const router = express.Router();

router.get("/", getActiveServicePackages);
router.get("/admin", protect, admin, getAllServicePackages);
router.post("/", protect, admin, createServicePackage);
router.patch("/:id", protect, admin, updateServicePackage);
router.delete("/:id", protect, admin, deactivateServicePackage);

export default router;
