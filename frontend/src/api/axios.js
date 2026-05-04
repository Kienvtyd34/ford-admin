import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ford-admin.onrender.com/api' 
});


api.interceptors.request.use((config) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo && userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
});

export default api;