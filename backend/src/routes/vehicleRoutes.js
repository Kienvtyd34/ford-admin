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
  getSalesDashboard,
  addVehicleColor,
  getColorsByModel,
  deleteVehicleColor,
  updateVehicleColor,
  getColorsByVariant,
  updateInventory,
  updateVariant,
  deleteVariant,
  getVariantsByModel
} from "../controllers/vehicleController.js";

import { protect, staff, admin } from "../middleware/authMiddleware.js";

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
  admin,
  updateInventory
);

router.post(
  "/inventory",
  protect,
  admin,
  addInventory
);

// ================= DASHBOARD =================

router.get(
  "/dashboard",
  protect,
  staff,
  getSalesDashboard
);

// ================= VEHICLE =================

// ADD VEHICLE
router.post(
  "/",
  protect,
  admin,
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
  admin,
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
  admin,
  deleteVehicle
);

// ================= VARIANT =================

router.post(
  "/variants",
  protect,
  admin,
  addVariant
);
router.put(
  "/variants/:id",
  protect,
  admin,
  updateVariant
);

router.delete(
  "/variants/:id",
  protect,
  admin,
  deleteVariant
);

router.get(
  "/models/:modelId/variants",
  getVariantsByModel
);

// ================= VEHICLE COLORS =================

// ADD COLOR
router.post(
  "/colors",
  protect,
  admin,
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
  admin,
  uploadCloud.array("images", 5),
  updateVehicleColor
);

// DELETE COLOR
router.delete(
  "/colors/:id",
  protect,
  admin,
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