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

import { protect, staff } from "../middleware/authMiddleware.js";

import { uploadCloud } from "../config/cloudinary.js";

const router = express.Router();

// ================= PUBLIC =================

router.get("/", getVehicles);

router.get("/detail/:id", getVehicleDetails);

// ================= INVENTORY =================

router.get(
  "/inventory",
  protect,
  staff,
  getInventory
);

router.patch(
  "/inventory/:id",
  protect,
  staff,
  updateInventory
);

router.post(
  "/inventory",
  protect,
  staff,
  addInventory
);

// ================= DASHBOARD =================

router.get(
  "/dashboard",
  protect,
  staff,
  getDashboard
);

// ================= VEHICLE =================

// ADD VEHICLE
router.post(
  "/",
  protect,
  staff,
  uploadCloud.fields([
    {
      name: "images",
      maxCount: 10
    },
    {
      name: "imageUrl",
      maxCount: 1
    }
  ]),
  addVehicle
);

// UPDATE VEHICLE
router.patch(
  "/:id",
  protect,
  staff,
  uploadCloud.fields([
    {
      name: "images",
      maxCount: 10
    },
    {
      name: "imageUrl",
      maxCount: 1
    }
  ]),
  updateVehicle
);

// DELETE VEHICLE
router.delete(
  "/:id",
  protect,
  staff,
  deleteVehicle
);

// ================= VARIANT =================

router.post(
  "/variants",
  protect,
  staff,
  addVariant
);

// ================= VEHICLE COLORS =================

// ADD COLOR
router.post(
  "/colors",
  protect,
  staff,
  uploadCloud.array("images", 5),
  addVehicleColor
);

// GET COLORS BY VARIANT
router.get(
  "/colors/variant/:variantId",
  getColorsByVariant
);

// GET COLORS BY MODEL
router.get(
  "/colors/:modelId",
  getColorsByModel
);

// UPDATE COLOR
router.patch(
  "/colors/:id",
  protect,
  staff,
  uploadCloud.array("images", 5),
  updateVehicleColor
);

// DELETE COLOR
router.delete(
  "/colors/:id",
  protect,
  staff,
  deleteVehicleColor
);

// ================= DELIVERY =================

router.post(
  "/confirm-delivery/:bookingId",
  protect,
  staff,
  confirmDelivery
);

export default router;