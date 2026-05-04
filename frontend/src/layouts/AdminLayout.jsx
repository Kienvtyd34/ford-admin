import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();
  
  // Lấy thông tin user an toàn
  const storedUser = localStorage.getItem('userInfo');
  const userInfo = (storedUser && storedUser !== "undefined") ? JSON.parse(storedUser) : null;

  // --- BỔ SUNG KHAI BÁO BIẾN NÀY ĐỂ HẾT LỖI 'userRole' is not defined ---
  const userRole = userInfo?.user?.role; 

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* SIDEBAR BÊN TRÁI - CỐ ĐỊNH */}
      <aside className="w-64 bg-[#002C5F] text-white flex flex-col shadow-xl h-screen sticky top-0 z-50">
        <Link to='/' className="p-6 text-2xl font-black border-b border-blue-800 flex flex-col hover:bg-blue-900 transition-colors">
          <span>FORD</span>
          <span className="text-xs font-normal text-blue-300 tracking-widest uppercase">Hệ thống Admin</span>
        </Link>
        
        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          <Link 
            to="/admin/dashboard" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800 transition-all font-medium text-white"
          >
            <span className="text-xl">📂</span> Dashboard
          </Link>
          <Link 
            to="/admin/contacts" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800 transition-all font-medium text-white"
          >
            <span className="text-xl">📂</span> Quản lý khách hàng
          </Link>

          <Link 
            to="/admin/vehicle" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800 transition-all font-medium text-white"
          >
            <span className="text-xl">🚘</span> Quản lý Xe
          </Link>
          <Link 
            to="/admin/test-drive-list" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800 transition-all font-medium text-white"
          >
            <span className="text-xl">🚘</span> Quản lý Xe Demo
          </Link>
          
          <Link 
            to="/admin/inventory" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800 transition-all font-medium text-white"
          >
            <span className="text-xl">🚘</span> Quản lý kho xe
          </Link>

          <Link 
            to="/admin/news" 
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800 transition-all font-medium text-white"
          >
            <span className="text-xl">📰</span> Quản lý tin tức
          </Link>

          {/* Trường dành cho STAFF */}
          {userRole === 'staff' && (
            <Link 
              to="customer-info" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800 transition-all font-medium border-t border-blue-800 pt-5 mt-5 text-white"
            >
              <span className="text-xl">👤</span> Thông tin khách hàng
            </Link>
          )}

          {/* Trường dành cho ADMIN */}
          {userRole === 'admin' && (
            <Link 
              to="/admin/hr-management" 
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-800 transition-all font-medium border-t border-blue-800 pt-5 mt-5 text-white"
            >
              <span className="text-xl">👥</span> Quản lý nhân sự
            </Link>
          )}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 text-[10px] text-blue-400 text-center uppercase tracking-tighter border-t border-blue-800/50">
          © 2026 Ford Quế Võ - Nội bộ
        </div>
      </aside>

      {/* NỘI DUNG BÊN PHẢI */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hệ thống trực tuyến</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Thông tin User */}
            <div className="flex items-center gap-3 border-r pr-6 border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-blue-600 uppercase leading-none mb-1">
                  {userRole === 'admin' ? 'Quản trị viên' : 'Nhân viên bán hàng'}
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {userInfo?.user?.fullName || "Người dùng"}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black shadow-md border-2 border-white">
                {(userInfo?.user?.fullName || "U").charAt(0).toUpperCase()}
              </div>
            </div>

            {/* NÚT ĐĂNG XUẤT */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-500 font-bold hover:text-red-600 transition-all group"
            >
              <div className="p-2 rounded-lg group-hover:bg-red-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <span className="text-xs uppercase tracking-wider hidden sm:inline">Thoát</span>
            </button>
          </div>
        </header>
        
        {/* VÙNG NỘI DUNG CHÍNH */}
        <main className="p-8 bg-[#F8FAFC] flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;