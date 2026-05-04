import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

const StaffCustomerInfo = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [highlightedName, setHighlightedName] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        params: { role: 'user' }
      }); 
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Lỗi kết nối API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xử lý hiệu ứng highlight khi chuyển từ Dashboard sang
  useEffect(() => {
    if (location.state?.highlightName) {
      // Đặt tên cần highlight
      setHighlightedName(location.state.highlightName);
      
      // Sau 3 giây gỡ bỏ class in đậm để trở lại bình thường
      const timer = setTimeout(() => {
        setHighlightedName(null);
        // Xóa state trong history để tránh lặp lại hiệu ứng khi refresh trang
        window.history.replaceState({}, document.title);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
      {/* Header đồng bộ với StaffManagement */}
      <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-white">
        <div>
          <h2 className="text-xl font-black text-blue-900 uppercase italic tracking-tighter">
            Thông tin tài khoản khách hàng
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-bold italic">
            Tìm thấy {users.length} khách hàng trong hệ thống
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Quyền hạn:</span>
          <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-lg font-black text-[10px] uppercase border border-blue-100 shadow-sm">
            Staff View Only
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-gray-400 font-bold italic animate-pulse uppercase tracking-widest text-xs">
            Đang truy xuất dữ liệu...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Khách hàng</th>
                <th className="px-6 py-4">Tài khoản (Username)</th>
                <th className="px-6 py-4">Số điện thoại</th>
                <th className="px-6 py-4 text-center">Ngày tham gia</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length > 0 ? (
                users.map((user) => {
                  const isHighlighted = highlightedName === user.fullName;
                  
                  return (
                    <tr 
                      key={user._id} 
                      className={`transition-all duration-700 ${
                        isHighlighted ? 'bg-yellow-50/80' : 'hover:bg-gray-50'
                      }`}
                    >
                      <td className="py-5 px-6">
                        <div className="flex flex-col gap-1">
                          <span className={`transition-all duration-500 transform ${
                            isHighlighted 
                            ? 'font-black text-red-600 scale-110 translate-x-2 italic underline decoration-red-200 underline-offset-4' 
                            : 'font-bold text-blue-900'
                          }`}>
                            {user.fullName}
                          </span>
                          {isHighlighted && (
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                                <span className="text-[9px] font-black text-red-500 uppercase italic">
                                  Đang xem chi tiết
                                </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium lowercase italic">
                        @{user.username}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-blue-600 font-bold text-sm bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                          {user.phone || "---"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-400 text-xs font-bold italic">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-green-100 text-green-700 uppercase tracking-tighter border border-green-200">
                          <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                          Online
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="p-20 text-center text-gray-300 font-black uppercase italic tracking-widest text-sm">
                    Dữ liệu trống
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="p-4 bg-gray-50/50 border-t border-gray-100">
        <p className="text-[9px] text-center text-gray-400 font-black uppercase tracking-[0.4em] italic">
          Security System - Internal Staff Access Only
        </p>
      </div>
    </div>
  );
};

export default StaffCustomerInfo;