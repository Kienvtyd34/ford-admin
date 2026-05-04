import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    // Sử dụng đường dẫn ngrok của bạn
    baseURL: 'https://ford-admin.onrender.com/api', 
    timeout: 10000,
});

// TỰ ĐỘNG GẮN TOKEN VÀO MỌI REQUEST
api.interceptors.request.use(async (config) => {
    try {
        const userInfoRaw = await AsyncStorage.getItem('userInfo');
        if (userInfoRaw) {
            const userInfo = JSON.parse(userInfoRaw);
            if (userInfo.token) {
                // Gắn token theo chuẩn Bearer
                config.headers.Authorization = `Bearer ${userInfo.token}`;
            }
        }
    } catch (error) {
        console.error("Lỗi lấy token từ bộ nhớ:", error);
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;

  //npx expo start --tunnel khác mạng chạy lệnh này