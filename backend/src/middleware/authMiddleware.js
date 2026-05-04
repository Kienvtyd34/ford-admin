import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Lấy token từ header
            token = req.headers.authorization.split(' ')[1];

            // Xác thực token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Lấy thông tin user và đính kèm vào request
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: "Người dùng không tồn tại" });
            }

            return next(); // Quan trọng: Phải có return để dừng hàm tại đây
        } catch (error) {
            console.error("JWT Verify Error:", error.message);
            return res.status(401).json({ message: "Phiên đăng nhập hết hạn hoặc Token lỗi" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập, không tìm thấy Token" });
    }
};

// Kiểm tra quyền Staff hoặc Admin (Dùng cho các chức năng quản lý chung)
export const staff = (req, res, next) => {
    if (req.user && (req.user.role === 'staff' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ 
            message: "Truy cập bị từ chối. Yêu cầu quyền Nhân viên hoặc Admin." 
        });
    }
};

// Kiểm tra quyền Admin tối cao
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Truy cập bị từ chối. Chỉ Admin mới có quyền này." });
    }
};