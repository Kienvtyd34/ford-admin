import React, { useState } from 'react';
import api from '../api/axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();


    const [formData, setFormData] = useState({
        username: "", 
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post('/users/login', {
                username: formData.username, 
                password: formData.password
            });

            if (res.data.success) {
   
    const dataToStore = {
        token: res.data.token,
        user: res.data.user 
    };
    
    localStorage.setItem('userInfo', JSON.stringify(dataToStore));

    const from = location.state?.from?.pathname || "/";
    navigate(from, { replace: true });
}
        } catch (err) {
            console.error("Đăng nhập thất bại:", err);
            setError(err.response?.data?.error || "Sai tên đăng nhập hoặc mật khẩu!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-blue-900 uppercase">Đăng nhập</h2>
                    <p className="text-gray-500 text-sm mt-2">Hệ thống Ford Quế Võ</p>
                </div>

                {/* Hiển thị thông báo lỗi nếu có */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-600">
                            Tên đăng nhập (Email)
                        </label>
                        <input 
                            type="email" 
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-900 outline-none transition-all"
                            placeholder="user@example.com"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value.trim()})}
                            required 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest mb-2 text-gray-600">
                            Mật khẩu
                        </label>
                        <input 
                            type="password" 
                            className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-900 outline-none transition-all"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full py-4 rounded-lg font-bold uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-900 hover:bg-red-600'
                        }`}
                    >
                        {loading ? 'Đang xác thực...' : 'Vào hệ thống'}
                    </button>

                    <div className="text-center mt-6">
                        <p className="text-gray-600 text-sm">
                            Chưa có tài khoản?{' '}
                            <Link to="/register" className="text-red-600 font-bold hover:underline">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;