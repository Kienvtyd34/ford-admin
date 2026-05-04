import React from 'react';
import { ThumbsUp, Tag, Wrench } from 'lucide-react';
import dl1 from '../assets/dealer1.jpg';
import dl2 from '../assets/dealer2.jpg';
import dl3 from '../assets/dealer3.webp';
import dl4 from '../assets/dealer5.jpg';
import gx1 from '../assets/giaoxe.jpg';
import gx2 from '../assets/giaoxe1.jpg';
import gx3 from '../assets/giaoxe2.jpg';

import staffImg from '../assets/staff1.jpg'; 

const ImageGalleryHome = () => {
  const events = [
    { id: 1, url: dl1, title: 'Sự kiện 1' },
    { id: 2, url: dl2, title: 'Sự kiện 2' },
    { id: 3, url: dl3, title: 'Sự kiện 3' },
    { id: 4, url: dl4, title: 'Sự kiện 4' },
  ];

  const services = [
    { id: 1, icon: <ThumbsUp size={40} className="text-red-600" />, text: "GIÁ XE TỐT NHẤT" },
    { id: 2, icon: <Tag size={40} className="text-red-600" />, text: "NHẬN KHUYẾN MÃI NHIỀU NHẤT" },
    { id: 3, icon: null, text: "GIAO XE TẬN NHÀ", isSteering: true },
    { id: 4, icon: <Wrench size={40} className="text-red-600" />, text: "DỊCH VỤ HẬU MÃI CHU ĐÁO" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 font-sans text-gray-800">
      
      {/* --- NEW SECTION: GIỚI THIỆU VỀ CHÚNG TÔI (Hình image_cee54b.png) --- */}
      <section className="mb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold uppercase tracking-widest relative inline-block">
            Giới thiệu về chúng tôi
            <span className="block w-12 h-1 bg-red-600 mx-auto mt-2"></span>
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Ảnh bên trái */}
          <div className="w-full md:w-1/2">
            <div className="relative group overflow-hidden rounded-sm shadow-2xl">
              <img 
                src={staffImg || dl1} 
                alt="Đội ngũ nhân viên" 
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Nội dung bên phải */}
          <div className="w-full md:w-1/2 space-y-5 italic leading-relaxed text-lg">
            <p>
              <strong>Ford Quế Võ</strong> là nhà phân phối chính thức của Ford Việt Nam. 
              Chúng tôi cung cấp các sản phẩm và dịch vụ theo tiêu chuẩn của Ford Việt Nam và Ford trên toàn cầu.
            </p>
            <p>
              Với phương châm kinh doanh “Tất cả vì sự hài lòng của khách hàng”, Ford Quế Võ không những 
              đầu tư cơ sở vật chất và công nghệ hiện đại mà còn phát huy tối đa các nguồn nhân lực, đào tạo nhân sự 
              bài bản bởi các chuyên gia hàng đầu của Ford Việt Nam.
            </p>
          </div>
        </div>
      </section>
      {/* --- END NEW SECTION --- */}

      {/* SECTION 1: Lưới ảnh sự kiện */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {events.map((item) => (
          <div key={item.id} className="overflow-hidden rounded shadow-md hover:shadow-xl transition-shadow duration-300">
            <img 
              src={item.url} 
              alt={item.title} 
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500 cursor-pointer"
            />
          </div>
        ))}
      </div>

      {/* SECTION 2: Các ô dịch vụ cam kết */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {services.map((service) => (
          <div 
            key={service.id} 
            className="flex flex-col items-center justify-center p-8 bg-white border border-gray-100 rounded-xl shadow-sm hover:-translate-y-1 transition-all duration-300 text-center"
          >
            <div className="mb-4 bg-gray-50 p-4 rounded-full">
              {service.isSteering ? (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600">
                  <circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20"/><path d="m16 12-4-4-4 4"/>
                </svg>
              ) : service.icon}
            </div>
            <h3 className="font-bold text-gray-800 text-sm tracking-wide">
              {service.text}
            </h3>
          </div>
        ))}
      </div>

      {/* SECTION 3: Ảnh bàn giao xe lớn */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[gx1, gx2, gx3].map((img, index) => (
          <div key={index} className="overflow-hidden rounded-lg shadow-lg">
            <img 
              src={img} 
              alt={`Handover ${index + 1}`} 
              className="w-full h-72 object-cover hover:brightness-90 transition-all duration-300" 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGalleryHome;