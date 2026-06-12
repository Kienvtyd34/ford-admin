import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, lowercase: true, trim: true },
  
  // Liên kết trực tiếp tới xe để lấy thông số cho Chatbot/Admin
  vehicleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Vehicle' 
  },
  
  requestType: {
    type: String,
    enum: ['Nhận báo giá', 'Tư vấn trả góp'],
    required: true
  },
  
  // Quản lý lịch hẹn thực tế
  appointmentDate: { type: Date }, 
  
  // Gán nhân viên phụ trách (Role: Staff)
  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  message: { type: String },
  status: { 
    type: String, 
    enum: ['Chờ xử lý', 'Đã hoàn thành'],
    default: 'Chờ xử lý' 
  },
  noteFromStaff: String
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);