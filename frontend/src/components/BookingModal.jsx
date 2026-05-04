import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const BookingModal = ({ car, isOpen, onClose, selectedVariant, selectedColorName }) => {
    const [bookingData, setBookingData] = useState({
        variantName: "",
        colorName: "",
        notes: ""
    });
    const [loading, setLoading] = useState(false);
    const [createdBooking, setCreatedBooking] = useState(null);

    // Cấu hình ngân hàng (Khớp với cấu hình SePay của bạn)
    const BANK_CONFIG = {
        BANK_ID: "MB", 
        ACCOUNT_NO: "027204010314", 
        ACCOUNT_NAME: "NGUYEN DUC KIEN",
        AMOUNT: 2000 // Số tiền đặt cọc
    };

    // 1. Đồng bộ thông tin từ trang chi tiết vào Form khi mở Modal
    useEffect(() => {
        if (car && isOpen) {
            setBookingData({
                variantName: selectedVariant?.variantName || car.variants?.[0]?.variantName || "",
                colorName: selectedColorName || car.colorConfigs?.[0]?.colorName || "",
                notes: ""
            });
            setCreatedBooking(null);
        }
    }, [car, isOpen, selectedVariant, selectedColorName]);

    // 2. Cơ chế Polling: Kiểm tra trạng thái thanh toán từ Database
    useEffect(() => {
        let interval;
        if (createdBooking && createdBooking.paymentStatus === 'Pending') {
            interval = setInterval(async () => {
                try {
                    const res = await api.get(`/bookings/${createdBooking._id}`);
                    if (res.data.data.paymentStatus === 'Paid') {
                        setCreatedBooking(res.data.data);
                        clearInterval(interval);
                    }
                } catch (err) {
                    console.error("Đang kiểm tra trạng thái thanh toán...");
                }
            }, 3000); // Kiểm tra mỗi 3 giây
        }
        return () => clearInterval(interval);
    }, [createdBooking]);

    // 3. Xử lý tạo đơn hàng
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/bookings', {
                vehicleId: car._id,
                variantName: bookingData.variantName,
                colorName: bookingData.colorName,
                notes: bookingData.notes,
                depositAmount: BANK_CONFIG.AMOUNT 
            });
            if (res.data.success) {
                setCreatedBooking(res.data.data);
            }
        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.error || "Không thể tạo đơn hàng"));
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !car) return null;

    // --- MÀN HÌNH 2: THANH TOÁN QR (Đang chờ thanh toán) ---
    if (createdBooking && createdBooking.paymentStatus === 'Pending') {
        const shortId = String(createdBooking._id).slice(-10).toUpperCase(); 
        const description = `DATCOC ${shortId}`;
        
        // URL VietQR tối ưu hiển thị
        const qrUrl = `https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-qr_only.png?amount=${BANK_CONFIG.AMOUNT}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`;
        
        return (
            <div className="fixed inset-0 bg-black/60 z-[999] flex justify-center items-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 border-t-4 border-blue-600">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-black text-blue-900 uppercase italic">Quét mã đặt cọc</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tự động xác nhận sau khi nhận tiền</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-b pb-6">
                        <div className="text-center space-y-3">
                            <div className="bg-white p-2 rounded-xl border-2 border-dashed border-blue-200 inline-block">
                                <img 
                                    src={qrUrl} 
                                    alt="QR Code" 
                                    className="w-48 h-48 mx-auto object-contain"
                                />
                            </div>
                            <div className="text-[11px] space-y-1">
                                <p className="font-bold text-gray-700">{BANK_CONFIG.ACCOUNT_NAME}</p>
                                <p className="text-blue-600 font-mono font-bold italic">{BANK_CONFIG.ACCOUNT_NO}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 flex flex-col items-center justify-center text-center h-full">
                                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-900 border-t-transparent mb-4"></div>
                                <p className="text-xs font-black text-blue-900 uppercase leading-relaxed">
                                    Đang chờ SePay <br/> xác nhận tiền về...
                                </p>
                                <p className="text-[9px] text-gray-400 mt-2 italic">Vui lòng không tắt trình duyệt</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                         <p className="text-[10px] text-yellow-700 font-bold uppercase text-center mb-1">Nội dung chuyển khoản (Bắt buộc khớp):</p>
                         <p className="font-mono text-blue-900 font-bold text-center bg-white py-2 rounded text-sm border uppercase shadow-sm">
                            {description}
                         </p>
                    </div>
                    
                    <button onClick={onClose} className="mt-6 w-full py-2 text-gray-400 font-bold uppercase text-[10px] hover:text-red-500 transition-colors">Hủy và quay lại</button>
                </div>
            </div>
        );
    }

    // --- MÀN HÌNH 3: THÀNH CÔNG ---
    if (createdBooking && createdBooking.paymentStatus === 'Paid') {
        return (
            <div className="fixed inset-0 bg-black/60 z-[999] flex justify-center items-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-8 border-t-8 border-green-600 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-blue-900 italic uppercase">Đặt cọc thành công</h2>
                    <p className="text-gray-500 text-sm mt-2">Cảm ơn bạn! Đơn hàng đã được hệ thống xác nhận tự động.</p>
                    <div className="bg-blue-50 p-4 rounded-xl my-6 flex justify-between items-center">
                        <span className="text-sm font-bold text-blue-900 uppercase">Mã đơn:</span>
                        <span className="text-sm font-mono font-bold text-blue-700">#{createdBooking._id.toUpperCase()}</span>
                    </div>
                    <button onClick={onClose} className="w-full py-3 bg-blue-900 text-white rounded-xl font-bold uppercase text-xs shadow-lg">Đóng cửa sổ</button>
                </div>
            </div>
        );
    }

    // --- MÀN HÌNH 1: FORM NHẬP THÔNG TIN ---
    return (
        <div className="fixed inset-0 bg-black/60 z-[999] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="bg-blue-900 p-5 text-white flex justify-between items-center">
                    <div>
                        <h3 className="font-bold uppercase italic tracking-wider">Phiếu Đặt Cọc Xe</h3>
                        <p className="text-[10px] text-blue-200 uppercase font-bold">{car.name}</p>
                    </div>
                    <button onClick={onClose} className="text-2xl hover:text-red-400 transition-colors">&times;</button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">1. Phiên bản xe đã chọn</label>
                        <select 
                            className="w-full border-2 border-gray-100 rounded-xl p-3 bg-gray-50 text-sm font-bold text-gray-700 outline-none focus:border-blue-500 transition-all"
                            value={bookingData.variantName}
                            onChange={(e) => setBookingData({...bookingData, variantName: e.target.value})}
                        >
                            {car.variants?.map((v, i) => (
                                <option key={i} value={v.variantName}>
                                    {v.variantName} — {v.variantPrice?.toLocaleString()}₫
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-2">2. Màu sắc ưu tiên</label>
                        <div className="flex flex-wrap gap-2">
                            {car.colorConfigs?.map((color, i) => (
                                <button
                                    key={i} type="button"
                                    onClick={() => setBookingData({...bookingData, colorName: color.colorName})}
                                    className={`px-4 py-2 rounded-lg border-2 text-[10px] font-black transition-all uppercase ${
                                        bookingData.colorName === color.colorName 
                                        ? 'bg-blue-900 text-white border-blue-900 shadow-md' 
                                        : 'bg-white text-gray-400 border-gray-100 hover:border-blue-200'
                                    }`}
                                >
                                    {color.colorName}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">3. Ghi chú yêu cầu thêm</label>
                        <textarea 
                            className="w-full border-2 border-gray-100 rounded-xl p-3 bg-gray-50 text-xs outline-none focus:border-blue-500 transition-all resize-none"
                            rows="2"
                            placeholder="Ví dụ: Giao xe vào ngày tốt..."
                            value={bookingData.notes}
                            onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                        />
                    </div>

                    <div className="pt-2 border-t border-dashed">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-gray-400 uppercase italic">Số tiền đặt cọc giữ xe:</span>
                            <span className="text-xl font-black text-red-600">{BANK_CONFIG.AMOUNT.toLocaleString()}₫</span>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-widest shadow-xl transition-all ${
                                loading ? 'bg-gray-400' : 'bg-blue-900 hover:bg-blue-800 active:scale-95'
                            }`}
                        >
                            {loading ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;