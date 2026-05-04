import express from "express";
import {
    getVehicles,
    getVehicleDetails,
    getInventory,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    confirmDelivery,
    addInventory,
    addVariant,
    getDashboard,
    addVehicleColor,
    getColorsByModel,
    deleteVehicleColor,
    updateVehicleColor,
    getColorsByVariant,
    updateInventory
} from "../controllers/vehicleController.js";

import { protect, staff } from '../middleware/authMiddleware.js';
import uploadCloud from '../config/cloudinary.js';

const router = express.Router();

// PUBLIC
router.get("/", getVehicles);
router.get("/detail/:id", getVehicleDetails);

// ADMIN
router.get("/inventory", protect, staff, getInventory);

// ✅ FIX CLOUDINARY
router.post("/", protect, staff, uploadCloud.single("image"), addVehicle);

router.patch("/:id", protect, staff, uploadCloud.single("image"), updateVehicle);

router.delete("/:id", protect, staff, deleteVehicle);

router.post("/confirm-delivery/:bookingId", protect, staff, confirmDelivery);

router.post("/variants", protect, staff, addVariant);

router.post("/inventory", protect, staff, addInventory);

router.get("/dashboard", protect, staff, getDashboard);

// ✅ FIX COLOR UPLOAD
router.post(
    "/colors",
    protect,
    staff,
    uploadCloud.array("images", 5),
    addVehicleColor
);
router.get("/colors/variant/:variantId", getColorsByVariant);
router.get("/colors/:modelId", getColorsByModel);
router.delete("/colors/:id", protect, staff, deleteVehicleColor);
router.patch("/colors/:id", protect, staff, uploadCloud.array("images", 5), updateVehicleColor);
router.patch("/inventory/:id", protect, staff, updateInventory);

export default router;