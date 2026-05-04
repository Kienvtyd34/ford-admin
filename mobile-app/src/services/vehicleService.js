import axios from 'axios';

const API_URL = 'https://ford-admin.onrender.com/api/vehicles';

// Thêm tham số 'params' vào hàm để truyền query string (search, type, isHot)
export const getVehicles = async (params = "") => {
    try {
        // Nối thêm params vào cuối URL (Ví dụ: http://.../vehicles?search=ranger)
        const response = await axios.get(`${API_URL}${params}`);
        return response.data;
    } catch (error) {
        console.error("Lỗi gọi API xe:", error);
        throw error;
    }
};