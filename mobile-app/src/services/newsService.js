import axios from 'axios';

// Sử dụng IP máy tính 
const API_URL = 'https://ford-admin.onrender.com/api/news';

export const getNews = async () => {
    try {
        const response = await axios.get(API_URL);
        // Backend của bạn trả về { success: true, data: [...] }
        return response.data.data;
    } catch (error) {
        console.error("Lỗi lấy tin tức:", error);
        throw error;
    }
};

export const getNewsBySlug = async (slug) => {
    try {
        const response = await axios.get(`https://ford-admin.onrender.com/api/news/${slug}`);
        return response.data.data;
    } catch (error) {
        console.error("Lỗi lấy chi tiết tin:", error);
        throw error;
    }
};