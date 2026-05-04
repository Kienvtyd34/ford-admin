import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
    // Lấy thông tin đăng nhập từ LocalStorage
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // Nếu chưa đăng nhập: Đá về trang login
    if (!userInfo) {
        return <Navigate to="/login" />;
    }

    // Nếu đã đăng nhập nhưng Role không nằm trong danh sách được phép: Đá về trang chủ
    if (roles && !roles.includes(userInfo.user.role)) {
        return <Navigate to="/" />;
    }

    // Nếu hợp lệ: Cho phép xem trang quản trị
    return children;
};

export default ProtectedRoute;