import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const ContactForm = () => {
  const [formData, setFormData] = useState({ 
    fullName: '', 
    phone: '', 
    vehicleId: '', // Thay đổi từ carName thành vehicleId để lưu ID
    requestType: 'Nhận báo giá', 
    appointmentDate: '', // THÊM MỚI: Ngày giờ hẹn
    message: '' 
  });

  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/vehicles');
        setVehicles(res.data.data || res.data);
      } catch (err) {
        console.error("Lỗi lấy danh sách xe:", err);
      }
    };
    fetchVehicles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gửi formData chứa vehicleId và appointmentDate lên backend
      const res = await api.post('/contacts/send', formData); 
      if (res.data.success) {
        alert("Thành công: " + res.data.message);
        setFormData({ 
          fullName: '', 
          phone: '', 
          vehicleId: '', 
          requestType: 'Nhận báo giá', 
          appointmentDate: '', 
          message: '' 
        });
      }
    } catch (error) {
      console.error("Lỗi gửi form:", error);
      alert("Lỗi: " + (error.response?.data?.error || "Không thể gửi yêu cầu"));
    }
  };

  return (
    <section className="relative py-20 bg-blue-900 overflow-hidden">
      <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4 select-none">
        <h1 className="text-[250px] font-black text-white">FORD</h1>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="text-white">
            <h2 className="text-4xl font-black mb-6 uppercase leading-tight">
              Đăng ký lái thử <br/> & Tư vấn xe
            </h2>
            <p className="text-blue-100 mb-8 text-lg italic">
              Hãy để lại thông tin, đội ngũ Ford Quế Võ sẽ liên hệ hỗ trợ bạn sở hữu chiếc xe ưng ý với mức giá và chính sách trả góp tốt nhất.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white">📞</span>
              </div>
              <div>
                <p className="text-sm opacity-70">Hotline hỗ trợ 24/7</p>
                <p className="text-xl font-bold">0338 797 170</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Họ và tên *</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-600 outline-none transition"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Số điện thoại *</label>
                  <input 
                    type="tel" required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-600 outline-none transition"
                    placeholder="09xx xxx xxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Bạn đang quan tâm xe nào?</label>
                  <select 
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-600 outline-none transition bg-white font-medium"
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                  >
                    <option value="">-- Chọn dòng xe --</option>
                    {vehicles.map((car) => (
                      <option key={car._id} value={car._id}>
                        {car.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Hình thức yêu cầu *</label>
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  {['Nhận báo giá', 'Tư vấn trả góp'].map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer text-sm font-medium group">
                      <input 
                        type="radio" 
                        name="requestType" 
                        value={item}
                        checked={formData.requestType === item}
                        onChange={(e) => setFormData({...formData, requestType: e.target.value})}
                        className="w-4 h-4 accent-red-600"
                      /> 
                      <span className={formData.requestType === item ? "text-red-600 font-bold" : "text-gray-600"}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Lời nhắn (không bắt buộc)</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-red-600 outline-none transition h-20"
                  placeholder={formData.requestType === 'Tư vấn trả góp' ? "Vui lòng ghi chú số tiền muốn trả trước hoặc ngân hàng quan tâm..." : "Tôi cần tư vấn thêm về..."}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-red-600 text-white font-black py-4 rounded-lg hover:bg-red-700 transition-all shadow-lg uppercase tracking-[0.2em]"
              >
                Gửi thông tin ngay
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactForm;