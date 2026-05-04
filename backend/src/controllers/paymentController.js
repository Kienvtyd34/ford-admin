// 1. Nhớ thêm dòng import này ở đầu file!
import Booking from '../models/Booking.js'; 

export const handleSepayWebhook = async (req, res) => {
    try {
        const { content, id } = req.body;
        console.log(`[SePay] Giao dịch: ${id} | Nội dung: ${content}`);

        const match = content.match(/DATCOC[_\s]?([a-zA-Z0-9]+)/i);
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