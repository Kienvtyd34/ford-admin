import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const PriceList = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const res = await api.get('/vehicles');
                const data = res.data.success ? res.data.data : [];
                setVehicles(data);
                setLoading(false);
            } catch (err) {
                console.error("Lỗi kết nối:", err);
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + " VNĐ";
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900 mb-4"></div>
            <p className="text-blue-900 font-bold animate-pulse uppercase">Đang tải bảng giá Ford...</p>
        </div>
    );

    const rowVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { 
            opacity: 1, 
            y: 0, 
            transition: { duration: 0.6, ease: "easeOut" } 
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <div className="container mx-auto px-4 pt-20 max-w-6xl">
                {/* Tiêu đề trang */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl font-light text-gray-800 uppercase tracking-widest">Bảng giá xe Ford</h2>
                    <p className="text-gray-500 mt-2 italic">Ford Quế Võ luôn cập nhật bảng giá xe Ford sớm nhất và nhanh nhất</p>
                </motion.div>

                <div className="space-y-20">
                    {vehicles.length > 0 ? vehicles.map((item) => (
                        <motion.div 
                            key={item._id} 
                            variants={rowVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            className="grid md:grid-cols-12 gap-8 items-start border-b pb-16"
                        >
                            {/* Cột 1: Tên xe và Hình ảnh */}
                            <div className="md:col-span-4 text-center md:text-left">
                                <h3 className="text-3xl font-black text-slate-900 uppercase mb-6 tracking-tighter italic">
                                    {item.name}
                                </h3>
                                <div className="relative group cursor-pointer" onClick={() => navigate(`/vehicle/${item._id}`)}>
                                    <img 
                                        src={item.imageUrl} 
                                        alt={item.name} 
                                        loading="lazy"
                                        className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105" 
                                    />
                                </div>
                            </div>

                            {/* Cột 2: Bảng giá phiên bản */}
                            <div className="md:col-span-8">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b text-gray-400 uppercase text-[11px] tracking-widest font-bold">
                                            <th className="py-4 px-2">Phiên bản</th>
                                            <th className="py-4 px-2 text-right">Giá niêm yết</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm font-medium text-gray-700">
                                        {item.variants && item.variants.length > 0 ? (
                                            item.variants.map((variant) => (
                                                <tr key={variant._id} className="border-b hover:bg-gray-50 transition-colors">
                                                    <td className="py-5 px-2 font-bold text-slate-800 uppercase italic">
                                                        {/* CÁCH A: Chỉ hiển thị tên phiên bản từ database */}
                                                        {variant.variantName}
                                                    </td>
                                                    <td className="py-5 px-2 text-right text-red-600 font-black text-base">
                                                        {formatPrice(variant.basePrice)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr className="border-b">
                                                <td className="py-5 px-2 font-bold">Tiêu chuẩn</td>
                                                <td className="py-5 px-2 text-right text-red-600 font-black text-base">Liên hệ</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                {/* Nút hành động */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                                    <button 
                                        onClick={() => navigate('/lien-he', { state: { carName: item.name } })}
                                        className="bg-red-600 text-white py-4 rounded-sm font-black text-[11px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100"
                                    >
                                        Đăng ký nhận báo giá
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/vehicle/${item._id}`)}
                                        className="bg-slate-900 text-white py-4 rounded-sm font-black text-[11px] uppercase tracking-widest hover:bg-black transition-all shadow-sm"
                                    >
                                        Thông số kỹ thuật {'>'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="text-center py-20 text-gray-400 uppercase tracking-widest border-2 border-dashed rounded-xl">
                            Chưa có dữ liệu xe trong hệ thống
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PriceList;