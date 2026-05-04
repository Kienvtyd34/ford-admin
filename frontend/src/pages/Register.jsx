import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const dataToSend = {
            fullName: formData.fullName, // "Nguyễn Đức Kiên"
            username: formData.email,    // Gán email làm username
            email: formData.email,       // dtc225200513@ictu.edu.vn
            phone: formData.phone,
            password: formData.password
        };
        const res = await axios.post('https://ford-admin.onrender.com/api/users/register', dataToSend);
        if (res.data.success) {
            alert("Đăng ký thành công! Hãy check email của bạn.");
        }
    } catch (error) {
        alert(error.response?.data?.message || "Lỗi đăng ký");
    }finally {
        setLoading(false); // Kết thúc load
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
            <ToastContainer position="top-center" />
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-blue-900 uppercase tracking-wider">
                        Tạo Tài Khoản
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 italic">
                        Gia nhập hệ thống Ford Quế Võ
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Họ và tên khách hàng</label>
                            <input
                                name="fullName"
                                type="text"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-50"
                                placeholder="Nguyễn Văn A"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Email đăng nhập</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-50"
                                placeholder="email@example.com"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Số điện thoại liên hệ</label>
                            <input
                                name="phone"
                                type="text"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-50"
                                placeholder="0987xxxxxx"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Mật khẩu bảo mật</label>
                            <input
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-50"
                                placeholder="••••••••"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white ${loading ? 'bg-gray-400' : 'bg-red-700 hover:bg-red-800'} transition-all duration-200 uppercase`}
                        >
                            {loading ? 'Đang khởi tạo...' : 'Đăng ký ngay'}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-gray-500">Đã có tài khoản? </span>
                        <Link to="/login" className="font-bold text-blue-900 hover:text-blue-700 underline">
                            Đăng nhập ngay
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;