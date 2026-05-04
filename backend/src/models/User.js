import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // Dùng làm ID đăng nhập
    email: { type: String, required: true, unique: true },    // Dùng để gửi mail xác thực
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },           // Trạng thái xác thực
    emailToken: { type: String },                            // Token gửi qua mail
    role: { 
        type: String, 
        enum: ['user', 'staff', 'admin'], 
        default: 'user' 
    }
}, { timestamps: true });

// Middleware tự động mã hóa mật khẩu
userSchema.pre('save', async function() {
    // 1. Nếu mật khẩu không đổi thì dừng lại
    if (!this.isModified('password')) return;

    try {
        // 2. Mã hóa mật khẩu (Không dùng next)
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
    } catch (error) {
        throw error; // Ném lỗi để Mongoose bắt được
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcryptjs.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);