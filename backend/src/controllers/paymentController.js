import Booking from '../models/Booking.js';
import {
    processServicePaymentWebhook,
    verifyServiceWebhook,
} from '../utils/servicePayment.js';

export const handleSepayWebhook = async (req, res) => {
    try {
        if (!verifyServiceWebhook(req)) {
            const reason = process.env.SEPAY_WEBHOOK_SECRET
                ? "authorization header did not match configured secret"
                : "SEPAY_WEBHOOK_SECRET is not configured";
            console.warn(`[SePay] Webhook rejected: ${reason}`);
            return res.status(401).send("Webhook không hợp lệ");
        }

        const serviceResult = await processServicePaymentWebhook(req.body);
        if (serviceResult.handled) {
            console.info(`[SePay] Service payment ${serviceResult.paid ? "accepted" : "not applied"}: ${serviceResult.message}`);
            return res.status(200).send(serviceResult.message);
        }

        const { content, id } = req.body;
        console.log(`[SePay] Giao dịch: ${id} | Nội dung: ${content}`);

        if (typeof content !== 'string') {
            return res.status(200).send("Webhook không có nội dung chuyển khoản");
        }

        const match = content.match(/DATCOC[_\s-]?([a-zA-Z0-9]+)/i);
        const bookingCode = match ? match[1].toUpperCase() : null;

        if (!bookingCode) {
            return res.status(200).send("Nội dung không chứa mã đơn hàng");
        }
        
        const bookings = await Booking.find({ paymentStatus: 'Pending' });
        
        const booking = bookings.find(b => 
            b._id.toString().toUpperCase() === bookingCode || 
            b._id.toString().toUpperCase().endsWith(bookingCode)
        );

        if (booking) {
            if (booking.paymentStatus === 'Paid') return res.status(200).send("Đã xử lý trước đó");

            booking.paymentStatus = 'Paid';
            booking.paidAt = new Date();
            booking.sepayTransactionId = id; 
            await booking.save();
            
            console.log(`✅ Thành công: Cập nhật đơn hàng ${booking._id}`);
            return res.status(200).send("OK");
        }

        console.log(`❌ Thất bại: Không tìm thấy đơn hàng nào khớp với mã "${bookingCode}"`);
        res.status(200).send("Không tìm thấy đơn hàng");
    } catch (error) {
        console.error("Lỗi hệ thống Webhook:", error);
        res.status(500).send("Internal Error");
    }
};