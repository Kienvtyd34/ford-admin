import express from "express";
import {
  getCarPrice,
  recommendCar,
  getCarDetail,
  checkAvailability,
  getCarColors
} from "../controllers/chatbot.controller.js";

const router = express.Router();

router.get("/price", getCarPrice);
router.get("/recommend", recommendCar);
router.get("/detail", getCarDetail);
router.get("/availability", checkAvailability);
router.get("/colors", getCarColors);

export default router;