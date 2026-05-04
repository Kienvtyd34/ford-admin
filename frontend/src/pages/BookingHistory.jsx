import React, { useEffect, useState, useRef } from 'react';
import api from '../api/axios';

const BookingHistory = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showQRBooking, setShowQRBooking] = useState(null);
    const [successBooking, setSuccessBooking] = useState(null); // State cho thông báo thành công
    
    // useRef để lưu danh sách cũ nhằm so sánh trạng thái thanh toán
    const prevBookingsRef = useRef([]);

    const BANK_CONFIG = {
        BANK_ID: "MB",
        ACCOUNT_NO: "027204010314",
        ACCOUNT_NAME: "NGUYEN DUC KIEN"
    };

    const fetchMyBookings = async (isFirstLoad = false) => {
        try {
            const res = await api.get('/bookings/my-history');
            const allBookings = res.data.data || [];

            const validBookings = allBookings.filter((item) => {
                if (item.paymentStatus === 'Paid' || item.orderStatus === 'Completed') return true;
                const hoursDiff = (new Date() - new Date(item.createdAt)) / (1000 * 60 * 60);
                return hoursDiff < 24;
            });

            // LOGIC KIỂM TRA SEPAY VỪA XÁC NHẬN THÀNH CÔNG
            if (!isFirstLoad) {
                validBookings.forEach(newDoc => {
                    const oldDoc = prevBookingsRef.current.find(o => o._id === newDoc._id);
                    // Nếu đơn này cũ là chưa Paid, nhưng mới đã là Paid
                    if (oldDoc && oldDoc.paymentStatus !== 'Paid' && newDoc.paymentStatus === 'Paid') {
                        setShowQRBooking(null); // Tự động đóng QR đang mở
                        setSuccessBooking(newDoc); // Hiển thị Modal thành công
                    }
                });
            }

            prevBookingsRef.current = validBookings;
            setBookings(validBookings);
        } catch (err) {
            console.error("Lỗi tải lịch sử:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyBookings(true);
        const interval = setInterval(() => fetchMyBookings(false), 10000);
        return () => clearInterval(interval);
    }, []);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert("Đã sao chép nội dung chuyển khoản!");
    };

    if (loading) return <div className="text-center py-20 font-bold text-blue-900 uppercase italic">Đang kết nối dữ liệu...</div>;

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex justify-between items-end mb-8">
                    <h1 className="text-3xl font-black text-blue-900 uppercase italic border-l-8 border-blue-900 pl-4">Lịch sử đặt cọc</h1>
                    <p className="text-[10px] text-red-600 font-bold italic underline uppercase tracking-tighter">* Đơn chờ thanh toán quá 24h sẽ tự động hủy</p>
                </div>

                {bookings.length === 0 ? (
                    <div className="bg-white p-16 rounded-3xl text-center shadow-sm border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 font-bold uppercase text-sm italic">Hệ thống chưa ghi nhận giao dịch nào</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.map((item) => (
                            <div key={item._id} className={`bg-white rounded-2xl p-6 shadow-md border transition-all hover:shadow-xl flex flex-wrap md:flex-nowrap justify-between items-center gap-4 ${item.orderStatus === 'Completed' ? 'border-blue-500 bg-blue-50/20' : 'border-gray-100'}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-lg ${item.orderStatus === 'Completed' ? 'bg-blue-600' : 'bg-blue-900'}`}>
                                        <span className="font-black text-xl italic">F</span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-blue-900 uppercase text-lg leading-tight">{item.vehicle?.name}</h3>
                                        <p className="text-[10px] text-gray-400 font-mono font-bold uppercase">Mã đơn: #{item._id.slice(-10)}</p>
                                        <p className="text-[11px] font-bold text-slate-500">Đặt cọc lúc: {new Date(item.createdAt).toLocaleString('vi-VN')}</p>
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end gap-2">
                                    {item.orderStatus === 'Completed' ? (
                                        <div className="flex flex-col items-end bg-blue-100 px-4 py-2 rounded-xl border border-blue-200">
                                            <span className="text-blue-700 font-black text-[11px] uppercase italic">✅ Bàn giao xe ngày:</span>
                                            <span className="text-blue-900 font-black text-sm">{new Date(item.updatedAt).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                    ) : (
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border-2 ${item.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200 animate-pulse'}`}>
                                            {item.paymentStatus === 'Paid' ? '● Đã thanh toán' : '○ Chờ tiền về'}
                                        </span>
                                    )}
                                    <p className="font-black text-red-600 text-2xl tracking-tighter">{item.depositAmount?.toLocaleString('vi-VN')}₫</p>
                                    <div className="flex gap-3 mt-1">
                                        {item.orderStatus !== 'Completed' && item.paymentStatus !== 'Paid' && (
                                            <button onClick={() => setShowQRBooking(item)} className="bg-blue-900 hover:bg-black text-white text-[10px] px-5 py-2.5 rounded-lg font-black uppercase transition-all shadow-lg active:scale-95">Thanh toán ngay</button>
                                        )}
                                        {item.paymentStatus === 'Paid' && item.orderStatus !== 'Completed' && (
                                            <div className="flex items-center gap-1 text-green-600 text-[11px] font-black uppercase italic bg-green-50 px-3 py-1 rounded-lg">Giao dịch hoàn tất</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL THÔNG BÁO THÀNH CÔNG (HIỆN KHI SEPAY XÁC NHẬN) */}
            {successBooking && (
                <div className="fixed inset-0 bg-black/70 z-[1000] flex justify-center items-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl p-8 border-t-[12px] border-green-600 text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-black text-blue-900 italic uppercase leading-tight">Xác nhận thành công</h2>
                        <p className="text-gray-500 text-sm mt-3 font-medium">Hệ thống đã nhận được tiền cọc cho xe <span className="text-blue-900 font-bold">{successBooking.vehicle?.name}</span>. Cảm ơn quý khách!</p>
                        
                        <div className="bg-blue-50 p-4 rounded-2xl my-6 flex justify-between items-center border border-blue-100">
                            <span className="text-xs font-black text-blue-400 uppercase">Mã giao dịch:</span>
                            <span className="text-sm font-mono font-black text-blue-900">#{successBooking._id.slice(-10).toUpperCase()}</span>
                        </div>
                        
                        <button 
                            onClick={() => setSuccessBooking(null)} 
                            className="w-full py-4 bg-blue-900 hover:bg-black text-white rounded-2xl font-black uppercase text-xs shadow-xl transition-all active:scale-95"
                        >
                            Đóng thông báo
                        </button>
                    </div>
                </div>
            )}

            {/* MODAL QR CODE */}
            {showQRBooking && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative border-t-[12px] border-blue-900">
                        <button onClick={() => setShowQRBooking(null)} className="absolute -top-5 -right-5 bg-red-600 text-white w-10 h-10 rounded-full font-black shadow-xl">✕</button>
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-black text-blue-900 uppercase italic">Thanh toán ngay</h2>
                            <p className="text-[11px] text-gray-400 font-bold mt-1 uppercase italic underline decoration-red-400">Giữ đúng nội dung chuyển khoản bên dưới</p>
                        </div>
                        <div className="bg-white p-4 rounded-3xl border-4 border-blue-50 shadow-inner mb-6">
                            <img 
                                src={`https://img.vietqr.io/image/${BANK_CONFIG.BANK_ID}-${BANK_CONFIG.ACCOUNT_NO}-compact2.png?amount=${showQRBooking.depositAmount}&addInfo=DATCOC_${showQRBooking._id.slice(-10)}&accountName=${encodeURIComponent(BANK_CONFIG.ACCOUNT_NAME)}`} 
                                alt="QR Code" 
                                className="w-full h-auto rounded-xl"
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] uppercase font-black text-blue-400">Nội dung CK:</span>
                                    <button onClick={() => handleCopy(`DATCOC_${showQRBooking._id.slice(-10)}`)} className="text-[10px] font-black text-white bg-blue-900 px-2 py-1 rounded">SAO CHÉP</button>
                                </div>
                                <p className="font-mono text-center bg-white py-3 rounded-xl border-2 border-blue-100 text-blue-900 font-black text-lg uppercase">DATCOC_{showQRBooking._id.slice(-10)}</p>
                            </div>
                            <button onClick={() => setShowQRBooking(null)} className="w-full text-[11px] font-black text-gray-400 hover:text-blue-900 transition-colors uppercase mt-2 tracking-widest">Đóng cửa sổ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingHistory;