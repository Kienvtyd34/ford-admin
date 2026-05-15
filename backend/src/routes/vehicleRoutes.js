import express from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

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

import cloudinary from "../config/cloudinary.js";

const router = express.Router();

// ================= CLOUDINARY STORAGE =================

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "ford",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  })
});

const upload = multer({ storage });

// ================= PUBLIC =================

router.get("/", getVehicles);

router.get("/detail/:id", getVehicleDetails);

// ================= ADMIN =================

// INVENTORY
router.get("/inventory", protect, staff, getInventory);

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

// DASHBOARD
router.get(
  "/dashboard",
  protect,
  staff,
  getDashboard
);

// ================= VEHICLE =================

// THÊM XE
router.post(
  "/",
  protect,
  staff,
  upload.fields([
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

// UPDATE XE
router.patch(
  "/:id",
  protect,
  staff,
  upload.fields([
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

// XÓA XE
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

// ================= VEHICLE COLOR =================

// THÊM MÀU
router.post(
  "/colors",
  protect,
  staff,
  upload.array("images", 5),
  addVehicleColor
);

// LẤY MÀU THEO VARIANT
router.get(
  "/colors/variant/:variantId",
  getColorsByVariant
);

// LẤY MÀU THEO MODEL
router.get(
  "/colors/:modelId",
  getColorsByModel
);

// UPDATE MÀU
router.patch(
  "/colors/:id",
  protect,
  staff,
  upload.array("images", 5),
  updateVehicleColor
);

// XÓA MÀU
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