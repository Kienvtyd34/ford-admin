import express from 'express';
const router = express.Router();
import { 
    createBooking, 
    getBookingById, 
    getAllBookings,
    getMyBookings 
} from '../controllers/bookingController.js';
import { protect, staff } from '../middleware/authMiddleware.js';

// Các route cơ bản cần giữ lại
router.get("/", protect, staff, getAllBookings); 
router.post("/", protect, createBooking);
router.get("/my-history", protect, getMyBookings);
router.get("/:id", protect, getBookingById); 

export default router;