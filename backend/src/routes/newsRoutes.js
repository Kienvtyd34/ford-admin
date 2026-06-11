import express from 'express';
import { 
    getNews, 
    createNews, 
    updateNews, 
    deleteNews, 
    getNewsBySlug // Đảm bảo đã import hàm này
} from '../controllers/newsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- ROUTE CÔNG KHAI (Public) ---

// 1. Lấy danh sách tất cả tin tức
router.get('/', getNews);

// 2. Lấy chi tiết tin tức bằng SLUG (Dùng cho trang Detail)
// Lưu ý: Đặt route này ở đây để không bị nhầm với các ID phía dưới
router.get('/:slug', getNewsBySlug);


// --- ROUTE QUẢN TRỊ (Admin) ---

// 3. Tạo tin tức mới
router.post('/add', protect, admin, createNews);

// 4. Cập nhật tin tức bằng ID
router.put('/:id', protect, admin, updateNews);

// 5. Xóa tin tức bằng ID
router.delete('/:id', protect, admin, deleteNews);

export default router;