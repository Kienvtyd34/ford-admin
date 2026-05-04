import News from '../models/News.js';
import slugify from 'slugify';

// 1. Lấy chi tiết bài viết qua SLUG (Quan trọng nhất để hiển thị trang Detail)
export const getNewsBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        
        // Tìm bài viết và tự động tăng view lên 1
        const news = await News.findOneAndUpdate(
            { slug: slug },
            { $inc: { views: 1 } }, 
            { new: true }
        );

        if (!news) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
        }

        res.json({ success: true, data: news });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Lấy danh sách tin tức
export const getNews = async (req, res) => {
    try {
        const news = await News.find().sort({ createdAt: -1 });
        res.json({ success: true, data: news });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Tạo tin tức mới
export const createNews = async (req, res) => {
    try {
        const { title } = req.body;
        const slug = slugify(title, { lower: true, strict: true, locale: 'vi' });
        
        // Kiểm tra slug trùng lặp
        const existingNews = await News.findOne({ slug });
        const finalSlug = existingNews ? `${slug}-${Date.now()}` : slug;

        const news = await News.create({ ...req.body, slug: finalSlug });
        res.status(201).json({ success: true, data: news });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 4. Cập nhật tin tức
export const updateNews = async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title, { lower: true, strict: true, locale: 'vi' });
        }
        const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, data: news });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 5. Xóa tin tức
export const deleteNews = async (req, res) => {
    try {
        await News.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Đã xóa bài viết' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};