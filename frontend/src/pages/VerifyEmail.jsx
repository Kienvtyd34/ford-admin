import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token'); // Lấy ?token=... từ URL
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing'); // processing, success, error

    useEffect(() => {
        const verifyAccount = async () => {
            if (!token) {
                setStatus('error');
                return;
            }

            try {
                // Gọi API xác thực ở Backend
                const response = await axios.post('https://ford-admin.onrender.com/api/users/verify-email', { token });
                
                if (response.data.success) {
                    setStatus('success');
                    toast.success("Xác thực tài khoản thành công!");
                    // Tự động chuyển về trang đăng nhập sau 4 giây
                    setTimeout(() => navigate('/login'), 4000);
                }
            } catch (error) {
                console.error("Verification Error:", error);
                setStatus('error');
                toast.error("Link xác thực không hợp lệ hoặc đã hết hạn.");
            }
        };

        verifyAccount();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <ToastContainer />
            <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl text-center border border-blue-50">
                <div className="mb-6">
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Ford_logo_flat.svg/2560px-Ford_logo_flat.svg.png" 
                        alt="Ford Logo" 
                        className="h-10 mx-auto mb-4"
                    />
                </div>

                {status === 'processing' && (
                    <>
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-900 mx-auto mb-6"></div>
                        <h2 className="text-xl font-bold text-gray-700">Đang xác thực tài khoản...</h2>
                        <p className="text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="bg-green-100 text-green-600 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-blue-900">XÁC THỰC THÀNH CÔNG!</h2>
                        <p className="text-gray-600 mt-3">Chào mừng bạn đến với <b>Ford Quế Võ</b>. Hệ thống đang đưa bạn về trang đăng nhập...</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="mt-8 w-full py-3 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all"
                        >
                            ĐĂNG NHẬP NGAY
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="bg-red-100 text-red-600 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-red-700">XÁC THỰC THẤT BẠI</h2>
                        <p className="text-gray-600 mt-3">Mã xác thực không hợp lệ hoặc liên kết đã hết hiệu lực.</p>
                        <button 
                            onClick={() => navigate('/register')}
                            className="mt-8 w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-black transition-all"
                        >
                            QUAY LẠI ĐĂNG KÝ
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;