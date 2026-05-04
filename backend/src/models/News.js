import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Tiêu đề không được để trống'],
        trim: true 
    },
    slug: { type: String, unique: true },
    category: { 
        type: String, 
        enum: ['Tin tức', 'Khuyến mãi', 'Sự kiện', 'Đánh giá xe'],
        default: 'Tin tức' 
    },
    // Ảnh đại diện chính (hiện ở danh sách tin)
    thumbnail: { 
        type: String, 
        required: [true, 'Phải có ảnh đại diện bài viết'] 
    },
    // --- THÊM MỚI: Mảng ảnh bổ sung cho bài viết sinh động ---
    images: [{
        type: String // Chứa các URL ảnh chi tiết
    }],
    summary: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, default: 'Admin Ford Quế Võ' },
    views: { type: Number, default: 0 }
}, {
    timestamps: true 
});

export default mongoose.model('News', NewsSchema);