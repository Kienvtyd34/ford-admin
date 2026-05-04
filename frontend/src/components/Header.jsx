import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ContactButtons from './ContactButtons';
import logo from '../assets/logoford.png';
import { useVehicles } from '../context/VehicleContext';

const Header = () => {
  const navigate = useNavigate();
  const { vehicles } = useVehicles(); 
  const [isVehiclesOpen, setIsVehiclesOpen] = useState(false);

  // Xử lý thông tin người dùng từ LocalStorage
  const storedUser = localStorage.getItem('userInfo');
  const userInfo = (storedUser && storedUser !== "undefined") ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    if(window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
        localStorage.removeItem('userInfo');
        navigate('/login'); 
    }
  };

  // Hàm định dạng tiền tệ
  const formatCurrency = (price) => {
    if (!price || isNaN(price)) return "Liên hệ";
    return new Intl.NumberFormat('vi-VN').format(price) + " đ";
  };

  return (
    <header className="sticky top-0 bg-white shadow-md z-50">
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
        
        {/* KHỐI 1: BÊN TRÁI - LOGO & BRAND */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center gap-2 md:gap-3 group">
            <div className="h-10 md:h-14 w-auto overflow-hidden transition-transform duration-300 group-hover:scale-105">
              <img 
                src={logo} 
                alt="Logo Ford Quế Võ" 
                className="h-full w-full object-contain" 
              />
            </div>
            <div className="flex flex-col border-l-2 border-gray-100 pl-2 md:pl-3">
              <h1 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter 
                  bg-gradient-to-r from-[#002C5F] via-[#004a99] to-[#002C5F] 
                  bg-clip-text text-transparent leading-none py-1">
                FORD QUẾ VÕ
              </h1>
              <span className="text-[8px] md:text-[10px] font-bold text-red-600 tracking-[0.2em] uppercase">
                Đại lý ủy quyền
              </span>
            </div>
          </Link>
        </div>

        {/* KHỐI 2: Ở GIỮA - NAVIGATION MENU */}
        <nav className="hidden lg:flex space-x-6 font-bold uppercase text-xs items-center px-4">
          <Link to="/" className="hover:text-blue-700 transition-colors text-red-600 whitespace-nowrap">Trang chủ</Link>
          
          {/* Mega Menu Sản phẩm */}
          <div 
            className="relative group h-full flex items-center" 
            onMouseEnter={() => setIsVehiclesOpen(true)}
            onMouseLeave={() => setIsVehiclesOpen(false)}
          >
            <button className="flex items-center gap-1 hover:text-blue-700 transition-colors uppercase font-bold py-5 whitespace-nowrap">
              Sản phẩm
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${isVehiclesOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isVehiclesOpen && vehicles.length > 0 && (
              <div 
                className="absolute top-full left-1/2 -translate-x-1/2 w-[90vw] max-w-5xl bg-white shadow-2xl border-t-2 border-blue-900 p-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 z-[100] rounded-b-xl"
                style={{ marginTop: '-1px' }}
              >
                {vehicles.map((car) => {
                  const minPrice = car.variants && car.variants.length > 0 
                    ? Math.min(...car.variants.map(v => v.variantPrice))
                    : null;

                  return (
                    <Link 
                      key={car._id} 
                      to={`/vehicle/${car._id}`} 
                      className="flex flex-col items-center group/item transition-all"
                      onClick={() => setIsVehiclesOpen(false)} 
                    >
                      <div className="overflow-hidden mb-3 h-16 flex items-center justify-center">
                        <img 
                          src={car.imageUrl} 
                          alt={car.name} 
                          className="w-full h-full object-contain group-hover/item:scale-110 transition-transform duration-300" 
                        />
                      </div>
                      <span className="text-[10px] font-black text-gray-800 uppercase group-hover/item:text-red-600 text-center">
                        {car.name}
                      </span>
                      <span className="text-[9px] text-red-600 mt-1 font-bold text-center">
                        {minPrice ? `${formatCurrency(minPrice)}` : "Liên hệ"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          <Link to="/bang-gia" className="hover:text-blue-700 transition-colors font-black whitespace-nowrap">Bảng giá xe</Link>
          <Link to="/mua-xe-tra-gop" className="hover:text-blue-700 transition-colors font-black whitespace-nowrap">Mua xe trả góp</Link>
          <Link to="/tin-tuc" className="hover:text-blue-700 transition-colors font-black whitespace-nowrap">Tin tức</Link>
          
          {(userInfo?.user?.role === 'admin' || userInfo?.user?.role === 'staff') ? (
              <Link to="/admin/contacts" className="hover:text-blue-700 transition-colors font-black whitespace-nowrap bg-blue-50 px-3 py-1 rounded border border-blue-100">
                Hệ thống quản lý
              </Link>
          ) : (
              <>
                <Link to="/lien-he" className="hover:text-blue-700 transition-colors font-black whitespace-nowrap">
                  Liên hệ
                </Link>

                {/* ✅ FIX CHUẨN FLOW */}
                <Link to="/test-drive" className="hover:text-blue-700 transition-colors font-black whitespace-nowrap">
                  Đặt lái thử
                </Link>
              </>
          )}
        </nav>

        {/* KHỐI 3: BÊN PHẢI - AUTH & TOOLS */}
        <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
          
          <div className="hidden xl:flex flex-col items-end border-r pr-4 border-gray-100 shrink-0">
              <span className="text-[9px] text-gray-400 font-bold uppercase leading-none mb-1">Hotline 24/7</span>
              <a href="tel:0338797170" className="text-[#002C5F] font-black hover:text-red-600 transition-all text-sm whitespace-nowrap leading-none">
                0338 797 170
              </a>
          </div>

          <ContactButtons />

          {!userInfo ? (
            <div className="flex items-center gap-1 md:gap-2 ml-1">
              <Link to="/login" className="flex items-center gap-1.5 text-blue-900 px-3 py-2 rounded-lg hover:bg-blue-50">
                Đăng nhập
              </Link>
              <Link to="/register" className="bg-[#002C5F] text-white px-4 py-2 rounded-lg text-[11px] font-black uppercase">
                Đăng ký
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-4 ml-2 md:ml-4 border-l pl-2 md:pl-5">
              <div className="text-right hidden md:block shrink-0">
                <p className="text-xs font-black text-blue-900">
                  {userInfo.user.fullName || userInfo.user.username}
                </p>
              </div>
              <button onClick={handleLogout} className="text-red-600">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;