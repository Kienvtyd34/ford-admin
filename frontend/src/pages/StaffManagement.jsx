import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

const StaffManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState(''); 

  const location = useLocation();
  const [highlightedName, setHighlightedName] = useState(null);

  // Hàm lấy danh sách người dùng từ API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        params: { role: filterRole }
      }); 
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Lỗi kết nối API:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu khi component mount hoặc khi đổi bộ lọc
  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  // Hiệu ứng highlight dòng (nếu được điều hướng từ trang khác tới)
  useEffect(() => {
    if (location.state?.highlightName) {
      setHighlightedName(location.state.highlightName);
      
      const timer = setTimeout(() => {
        setHighlightedName(null);
        window.history.replaceState({}, document.title);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Cập nhật thông tin nhanh (ví dụ: Số điện thoại)
  const handleUpdateInfo = async (userId, updatedData) => {
    try {
      await api.patch(`/users/${userId}`, updatedData);
      fetchUsers();
    } catch (err) {
      alert("Lỗi khi cập nhật thông tin");
    }
  };

  // Thay đổi quyền hạn trực tiếp trên bảng
  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/update-role/${userId}`, { role: newRole });
      alert("Cập nhật quyền thành công!");
      fetchUsers();
    } catch (err) {
      alert("Lỗi khi cập nhật quyền");
    }
  };

  // Xóa tài khoản
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await api.delete(`/users/${id}`);
        alert("Xóa thành công!");
        fetchUsers();
      } catch (err) {
        alert("Lỗi khi xóa");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 relative">
      {/* HEADER & FILTER */}
      <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-xl font-black text-blue-900 uppercase italic tracking-tighter">Quản trị hệ thống nhân sự</h2>
           <p className="text-xs text-gray-400 mt-1 font-bold italic">Tìm thấy {users.length} tài khoản</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-gray-400 uppercase">Lọc theo:</span>
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50"
            >
              <option value="">Tất cả (All)</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="staff">Nhân viên (Staff)</option>
              <option value="user">Người dùng (User)</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-gray-400 font-bold italic animate-pulse">Đang tải dữ liệu...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[11px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Họ và tên & Số điện thoại</th>
                <th className="px-6 py-4">Tài khoản (Username)</th>
                <th className="px-6 py-4">Chức vụ (Role)</th>
                <th className="px-6 py-4">Ngày tham gia</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr 
                    key={user._id} 
                    className={`transition-all duration-500 ${highlightedName === user.fullName ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className={`transition-all duration-500 ${
                          highlightedName === user.fullName 
                          ? 'font-black text-red-600 scale-110 translate-x-2 italic' 
                          : 'font-bold text-blue-900'
                        }`}>
                          {user.fullName}
                        </span>
                        <input 
                          type="text"
                          defaultValue={user.phone || ""}
                          placeholder="Chưa có SĐT..."
                          onBlur={(e) => handleUpdateInfo(user._id, { phone: e.target.value })}
                          className="text-xs text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:outline-none w-32 italic transition-all"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{user.username}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={user.role} 
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`text-[11px] font-bold uppercase p-2 rounded-md outline-none transition-colors ${
                          user.role === 'admin' ? 'bg-red-100 text-red-700' : 
                          user.role === 'staff' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <option value="user">User</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs font-medium">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDelete(user._id)} 
                        className="text-gray-300 hover:text-red-600 transition-colors text-lg"
                        title="Xóa tài khoản"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-400 font-bold italic">Không tìm thấy tài khoản nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StaffManagement;