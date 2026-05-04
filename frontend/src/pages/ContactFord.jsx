import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ContactFord = () => {
    const [vehicles, setVehicles] = useState([]);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        vehicleId: '',
        requestType: 'Nhận báo giá',
        message: ''
    });

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const res = await api.get('/vehicles');
                if (res.data.success) setVehicles(res.data.data);
            } catch (err) {
                console.error("Lỗi tải danh sách xe:", err);
            }
        };
        fetchVehicles();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/contacts/send', formData);
            if (res.data.success) {
                alert("Gửi yêu cầu thành công! Ford Quế Võ sẽ liên hệ bạn sớm nhất.");
                setFormData({
                    fullName: '',
                    phone: '',
                    email: '',
                    vehicleId: '',
                    requestType: 'Nhận báo giá',
                    message: ''
                });
            }
        } catch (err) {
            console.error("Lỗi gửi form:", err);
            alert("Có lỗi xảy ra: " + (err.response?.data?.error || "Vui lòng thử lại sau."));
        }
    };

    return (
        <div className="font-sans bg-white min-h-screen">

            <div className="pt-40 pb-20 bg-[#002B5B] relative overflow-hidden">
                <div className="container mx-auto px-6 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                        Trung tâm Khách hàng Ford
                    </h1>
                    <p className="text-blue-200 uppercase tracking-[0.4em] text-xs font-bold">
                        Hỗ trợ tư vấn & Đăng ký lái thử
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    <div className="lg:col-span-5 space-y-8">
                        <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-black text-gray-800 uppercase mb-8 border-l-4 border-red-600 pl-4">
                                Thông tin liên hệ
                            </h2>

                            <div>
                                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Hotline 24/7</p>
                                <a href="tel:0338797170" className="text-3xl font-black text-[#002B5B] block mt-1 hover:text-red-600 transition-colors">
                                    0338.797.170
                                </a>
                            </div>

                            <div className="mt-6">
                                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Địa chỉ</p>
                                <p className="text-gray-700 font-bold">KCN Quế Võ, Bắc Ninh</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-7 bg-white p-2 md:p-8">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            <div className="md:col-span-2 flex flex-wrap gap-4 md:gap-8 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {['Nhận báo giá', 'Tư vấn trả góp'].map((type) => (
                                    <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="requestType"
                                            value={type}
                                            checked={formData.requestType === type}
                                            onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                                            className="w-4 h-4 accent-red-600"
                                        />
                                        <span className="text-[11px] md:text-xs font-black uppercase tracking-wider text-gray-600">
                                            {type}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            <input
                                placeholder="Họ và tên *"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="border p-2"
                            />

                            <input
                                placeholder="Số điện thoại *"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="border p-2"
                            />

                            <select
                                value={formData.vehicleId}
                                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                className="border p-2 md:col-span-2"
                            >
                                <option value="">-- Chọn xe --</option>
                                {vehicles.map(v => (
                                    <option key={v._id} value={v._id}>{v.name}</option>
                                ))}
                            </select>

                            <textarea
                                placeholder="Lời nhắn"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                className="border p-2 md:col-span-2"
                            />

                            <button className="bg-red-600 text-white p-3 md:col-span-2">
                                Gửi thông tin ngay
                            </button>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactFord;