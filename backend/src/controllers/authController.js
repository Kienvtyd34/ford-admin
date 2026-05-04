import crypto from 'crypto';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import * as SibApiV3Sdk from '@getbrevo/brevo'; // Sửa lại cách import này

// Tạo Token JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Hàm Đăng Ký
export const register = async (req, res) => {
    try {
        const { username, email, password, fullName, phone } = req.body;

        if (!fullName || !username || !email || !password) {
            return res.status(400).json({ success: false, message: "Vui lòng điền đầy đủ thông tin" });
        }

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) {
            return res.status(400).json({ success: false, message: "Email hoặc tên đăng nhập đã tồn tại" });
        }

        const emailToken = crypto.randomBytes(64).toString('hex');
        const user = new User({
            username, email, password, fullName, phone, emailToken, isVerified: false
        });

        await user.save();

        // --- CẤU HÌNH BREVO (CÁCH MỚI NHẤT) ---
        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailToken}`;

        sendSmtpEmail.subject = "Xác thực tài khoản Ford Quế Võ";
        sendSmtpEmail.htmlContent = `
            <div style="font-family: Arial; padding: 20px;">
                <h2>Chào ${fullName}!</h2>
                <p>Cảm ơn bạn đã đăng ký. Nhấn vào nút bên dưới để xác thực tài khoản:</p>
                <a href="${verifyUrl}" style="background: #003399; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">XÁC THỰC NGAY</a>
                <p>Nếu nút không hoạt động, copy link này: ${verifyUrl}</p>
            </div>`;
        sendSmtpEmail.sender = { "name": "Ford Quế Võ", "email": process.env.EMAIL_SENDER };
        sendSmtpEmail.to = [{ "email": email, "name": fullName }];

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        return res.status(201).json({ success: true, message: "Đăng ký thành công! Hãy kiểm tra email." });

    } catch (error) {
        console.error("LỖI ĐĂNG KÝ:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Các hàm login, verifyEmail... giữ nguyên như logic của bạn nhưng đảm bảo return đúng res
export const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu" });
        }

        if (!user.isVerified) {
            return res.status(401).json({ success: false, message: "Tài khoản chưa xác thực email!" });
        }

        res.json({
            success: true,
            token: generateToken(user._id),
            user: { id: user._id, username: user.username, fullName: user.fullName, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findOne({ emailToken: token });
        if (!user) return res.status(400).json({ success: false, message: "Token không hợp lệ" });

        user.isVerified = true;
        user.emailToken = null;
        await user.save();
        res.json({ success: true, message: "Xác thực thành công!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getUsersByRole = async (req, res) => {
    try {
        const { role } = req.query; 
        let query = {};

        // CHỈNH SỬA: Nếu người dùng là STAFF, họ CHỈ được phép xem khách hàng (role: 'user')
        if (req.user && req.user.role === 'staff') {
            query = { role: 'user' };
        } else {
            // Nếu là ADMIN, có thể xem theo role yêu cầu hoặc xem tất cả
            query = role ? { role: role } : {};
        }
        
        const users = await User.find(query).select("-password").sort({ createdAt: -1 });

        res.status(200).json({
            status: "success",
            results: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Lỗi máy chủ khi lấy danh sách người dùng"
        });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        // Chỉ cho phép các role hợp lệ
        const validRoles = ['user', 'staff', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Role không hợp lệ" });
        }

        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ message: "Lỗi cập nhật quyền" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const dataUpdate = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id, 
            dataUpdate, 
            { new: true } // Trả về dữ liệu sau khi đã cập nhật
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        res.status(200).json({
            success: true,
            data: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật thông tin", error: error.message });
    }
};



// Hàm xóa người dùng
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Không cho phép Admin tự xóa chính mình (tùy chọn bảo mật)
        if (req.user && req.user._id.toString() === id) {
            return res.status(400).json({ 
                success: false, 
                message: "Bạn không thể tự xóa tài khoản của chính mình" 
            });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Không tìm thấy người dùng để xóa" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Xóa người dùng thành công"
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Lỗi máy chủ khi xóa người dùng", 
            error: error.message 
        });
    }
};
