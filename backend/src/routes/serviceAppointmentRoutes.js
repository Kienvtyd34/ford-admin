import express from "express";
import { protect, staff } from "../middleware/authMiddleware.js";
import {
  cancelMyServiceAppointment,
  createServiceAppointment,
  getAllServiceAppointments,
  getAvailableServiceSlots,
  getMyServiceAppointmentById,
  getMyServiceAppointments,
  updateServiceAppointmentStatus,
} from "../controllers/serviceAppointmentController.js";

const router = express.Router();

router.get("/slots", getAvailableServiceSlots);
router.use(protect);
router.post("/", createServiceAppointment);
router.get("/my-history", getMyServiceAppointments);
router.get("/my-history/:id", getMyServiceAppointmentById);
router.patch("/my-history/:id/cancel", cancelMyServiceAppointment);
router.get("/", staff, getAllServiceAppointments);
router.patch("/:id/status", staff, updateServiceAppointmentStatus);

export default router;
