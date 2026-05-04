import React from 'react';
import { Link } from 'react-router-dom';

const VehicleCard = ({ vehicle }) => {
  // Hàm định dạng tiền tệ
  const formatPrice = (price) => {
    // Kiểm tra giá trị hợp lệ (không null, không undefined, là số và lớn hơn 0)
    if (!price || isNaN(price) || price <= 0) return "Liên hệ";
    
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(price);
  };

  const getStartingPrice = () => {
    // Kiểm tra nếu không có variants hoặc variants là mảng rỗng
    if (!vehicle.variants || vehicle.variants.length === 0) return "Liên hệ";

    // CHÚ Ý: Đổi v.variantPrice thành v.basePrice để khớp với Schema Mongoose
    const prices = vehicle.variants
      .map(v => v.basePrice) 
      .filter(p => p != null && p > 0); // Lọc bỏ các giá trị lỗi

    if (prices.length === 0) return "Liên hệ";

    const minPrice = Math.min(...prices);
    return formatPrice(minPrice);
  };

  return (
    <Link 
      to={`/vehicle/${vehicle._id}`} 
      className="bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full group cursor-pointer"
    >
      {/* 1. Phần hình ảnh */}
      <div className="h-64 w-full p-4 flex items-center justify-center relative overflow-hidden">
        <div className="absolute bottom-8 w-4/5 h-2 bg-black opacity-[0.03] blur-xl rounded-[100%] group-hover:opacity-10 transition-all duration-700"></div>
        <img 
          src={vehicle.imageUrl} 
          alt={vehicle.name} 
          className="max-w-[90%] max-h-[90%] object-contain z-10 transform group-hover:scale-110 transition-all duration-700"
        />
        <div className="absolute top-6 right-6 z-20">
          <span className="bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {vehicle.type}
          </span>
        </div>
      </div>

      {/* 2. Phần thông tin */}
      <div className="px-6 pb-8 flex flex-col flex-grow text-center">
        <h3 className="text-lg font-bold text-slate-900 uppercase mb-2 group-hover:text-blue-700 transition-colors leading-tight">
          {vehicle.name}
        </h3>
        <p className="text-slate-400 text-[11px] mb-1 font-medium uppercase tracking-widest">
          {vehicle.specs?.engine || "Advanced Ford Engine"}
        </p>
        <div className="text-slate-400 text-[10px] uppercase font-bold mb-1">Giá từ</div>
        <div className="text-red-600 text-xl font-black italic">
          {getStartingPrice()}
        </div>
        <div className="mt-6 flex justify-center">
          <span className="text-[10px] text-blue-800 font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-500 border-b-2 border-blue-800 pb-1">
            Xem chi tiết
          </span>
        </div>
      </div>
    </Link>
  );
};

export default VehicleCard;