import Booking from '../models/Booking.js';

// 🔥 IMPORT MODEL ĐỂ TRÁNH MissingSchema
import '../models/User.js';
import '../models/Inventory.js';
import '../models/Variant.js';
import '../models/VehicleModel.js';
import '../models/VehicleColor.js';


// ===== CREATE (GIỮ NGUYÊN vehicleId) =====
export const createBooking = async (req, res) => {
    try {
        const { vehicleId, variantName, colorName, notes } = req.body;

        const newBooking = new Booking({
            user: req.user._id,
            vehicle: vehicleId, // ✅ giữ nguyên API
            variantName,
            colorName,
            notes,
            paymentStatus: 'Pending'
        });

        const savedBooking = await newBooking.save();

        res.status(201).json({ success: true, data: savedBooking });

    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};


// ===== MY BOOKINGS =====
export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })

            // 🔥 populate nhiều tầng
            .populate({
                path: 'vehicle',
                populate: [
                    {
                        path: 'variantId',
                        populate: {
                            path: 'modelId'
                        }
                    },
                    {
                        path: 'colorId'
                    }
                ]
            })

            .sort('-createdAt');

        res.json({ success: true, data: bookings });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// ===== GET BY ID =====
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)

            .populate({
                path: 'vehicle',
                populate: [
                    {
                        path: 'variantId',
                        populate: {
                            path: 'modelId'
                        }
                    },
                    {
                        path: 'colorId'
                    }
                ]
            });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Không tìm thấy đơn" });
        }

        res.json({ success: true, data: booking });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};


// ===== GET ALL =====
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()

            .populate('user', 'fullName phone email')

            // 🔥 FIX CHÍNH Ở ĐÂY
            .populate({
                path: 'vehicle',
                populate: [
                    {
                        path: 'variantId',
                        populate: {
                            path: 'modelId'
                        }
                    },
                    {
                        path: 'colorId'
                    }
                ]
            })

            .populate({
                path: 'confirmedBy',
                select: 'fullName',
                options: { strictPopulate: false }
            })

            .sort('-createdAt');

        res.json({ success: true, data: bookings });

    } catch (error) {
        console.error("🔥 BOOKING ERROR FULL:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};


// ===== AUTO CANCEL =====
export const autoCancelExpiredBookings = async () => {
    try {
        const timeLimit = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const result = await Booking.updateMany(
            { 
                paymentStatus: 'Pending', 
                createdAt: { $lt: timeLimit } 
            },
            { paymentStatus: 'Failed' }
        );

        if(result.modifiedCount > 0) {
            console.log(`[Auto-Cancel] Đã hủy ${result.modifiedCount} đơn hàng quá hạn.`);
        }

    } catch (error) {
        console.error("Lỗi tự động hủy đơn:", error);
    }
};