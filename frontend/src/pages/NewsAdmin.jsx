import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import axios from 'axios';
import { Editor } from '@tinymce/tinymce-react';

const AdminNews = () => {
    const [news, setNews] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [idUpdate, setIdUpdate] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '', 
        category: 'Tin tức', 
        summary: '', 
        content: '', 
        thumbnail: '', 
        images: [] 
    });

    useEffect(() => { fetchAllNews(); }, []);

    const fetchAllNews = async () => {
        try {
            const res = await api.get('/news');
            setNews(res.data.data);
        } catch (err) { console.error("Lỗi lấy dữ liệu:", err); }
    };

    // --- HÀM UPLOAD ẢNH LÊN CLOUDINARY ---
    const handleFileUpload = async (e, type) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo?.token;

        try {
            if (type === 'thumbnail') {
                const uploadFormData = new FormData();
                uploadFormData.append('file', files[0]);
                const res = await axios.post('https://ford-admin.onrender.com/api/vehicles/upload-editor', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
                });
                setFormData(prev => ({ ...prev, thumbnail: res.data.location }));
            } else {
                // Upload Album (nhiều ảnh)
                const uploadedUrls = [];
                for (let i = 0; i < files.length; i++) {
                    const singleFormData = new FormData();
                    singleFormData.append('file', files[i]);
                    const res = await axios.post('https://ford-admin.onrender.com/api/vehicles/upload-editor', singleFormData, {
                        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
                    });
                    uploadedUrls.push(res.data.location);
                }
                setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedUrls] }));
            }
        } catch (err) {
            alert("Lỗi khi tải ảnh lên!");
        } finally {
            setUploading(false);
        }
    };

    const handleAction = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/news/${idUpdate}`, formData);
                alert("Cập nhật bài viết thành công!");
            } else {
                await api.post('/news/add', formData);
                alert("Đăng bài viết mới thành công!");
            }
            resetForm();
            fetchAllNews();
        } catch (err) { alert("Lỗi hệ thống khi lưu bài viết!"); }
    };

    const resetForm = () => {
        setFormData({ title: '', category: 'Tin tức', summary: '', content: '', thumbnail: '', images: [] });
        setIsEditing(false);
        setIdUpdate(null);
    };

    const startEdit = (item) => {
        setIsEditing(true);
        setIdUpdate(item._id);
        setFormData({
            title: item.title, 
            category: item.category, 
            summary: item.summary,
            content: item.content, 
            thumbnail: item.thumbnail,
            images: Array.isArray(item.images) ? item.images : []
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const deleteItem = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
            try {
                await api.delete(`/news/${id}`);
                fetchAllNews();
            } catch (err) { alert("Không thể xóa bài viết!"); }
        }
    };

    return (
        <div className="flex-1 p-8 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-[#002B5B] uppercase tracking-tight italic">Quản trị Hệ thống Tin tức</h1>
                    <p className="text-gray-400 text-sm">Hỗ trợ đăng ảnh trực tiếp & Trình soạn thảo chuyên nghiệp</p>
                </div>
                <div className="bg-[#002B5B] text-white px-6 py-2 rounded-lg font-bold text-sm">CLOUDINARY CONNECTED</div>
            </div>

            {/* Form đăng bài */}
            <div className="bg-white p-8 rounded-2xl shadow-sm mb-12 border border-gray-100">
                <h2 className="text-[#002B5B] font-bold uppercase mb-6 flex items-center">
                    <span className="w-1 h-6 bg-red-600 mr-3"></span>
                    {isEditing ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
                </h2>
                
                <form onSubmit={handleAction} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Tiêu đề bài viết</label>
                        <input type="text" className="w-full p-3 border rounded-lg focus:ring-2 ring-[#002B5B] outline-none font-semibold text-gray-700"
                            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    </div>
                    
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Chuyên mục</label>
                        <select className="w-full p-3 border rounded-lg outline-none font-bold text-gray-600 appearance-none"
                            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option>Tin tức</option><option>Khuyến mãi</option><option>Sự kiện</option><option>Đánh giá xe</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Ảnh đại diện (Thumbnail)</label>
                        <div className="flex items-center gap-4">
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'thumbnail')} className="text-xs" />
                            {formData.thumbnail && <img src={formData.thumbnail} className="w-16 h-12 object-cover rounded border" alt="Preview"/>}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Album ảnh chi tiết (Tải lên nhiều ảnh)</label>
                        <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'images')} className="text-xs mb-3 block" />
                        <div className="flex flex-wrap gap-3">
                            {formData.images.map((img, idx) => (
                                <div key={idx} className="relative group w-20 h-20">
                                    <img src={img} className="w-full h-full object-cover rounded-lg border shadow-sm" alt=""/>
                                    <button type="button" onClick={() => setFormData(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white w-5 h-5 rounded-full text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Mô tả ngắn (Sapo)</label>
                        <textarea className="w-full p-3 border rounded-lg outline-none" rows="2"
                            value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} required />
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block underline decoration-blue-500">Nội dung chi tiết</label>
                        <Editor
                            apiKey='gv0dobysumfihba6i2rhdg3v79x9bvpa2e33l13gmng5f0qv'
                            value={formData.content}
                            onEditorChange={(content) => setFormData({...formData, content})}
                            init={{
                                height: 500,
                                menubar: 'insert table view format',
                                plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount',
                                toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist | image table | removeformat',
                                automatic_uploads: true,
                                images_upload_handler: async (blobInfo) => {
                                    const uploadFormData = new FormData();
                                    uploadFormData.append('file', blobInfo.blob(), blobInfo.filename());
                                    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                                    const res = await axios.post('https://ford-admin.onrender.com/api/vehicles/upload-editor', uploadFormData, {
                                        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${userInfo?.token}` }
                                    });
                                    return res.data.location;
                                }
                            }}
                        />
                    </div>

                    <div className="flex gap-4">
                        <button type="submit" disabled={uploading} className={`${uploading ? 'bg-gray-400' : 'bg-[#002B5B]'} text-white px-10 py-3 rounded-lg font-black uppercase text-xs tracking-widest hover:bg-blue-900 transition-all shadow-lg`}>
                            {uploading ? "ĐANG TẢI ẢNH..." : (isEditing ? "Xác nhận cập nhật" : "Đăng bài ngay")}
                        </button>
                        {isEditing && <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-10 py-3 rounded-lg font-black uppercase text-xs tracking-widest">Hủy bỏ</button>}
                    </div>
                </form>
            </div>

            {/* Bảng danh sách bài viết */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#f8f9fa] border-b">
                        <tr className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                            <th className="p-5">Minh họa</th>
                            <th className="p-5">Thông tin bài viết</th>
                            <th className="p-5">Danh mục</th>
                            <th className="p-5 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {news.map(item => (
                            <tr key={item._id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                                <td className="p-5 w-32">
                                    <img src={item.thumbnail} className="w-24 h-16 object-cover rounded-lg shadow-sm" alt=""/>
                                </td>
                                <td className="p-5">
                                    <div className="font-bold text-[#002B5B] text-sm mb-1">{item.title}</div>
                                    <div className="text-[10px] text-gray-400 italic">Ngày đăng: {new Date(item.createdAt).toLocaleDateString('vi-VN')}</div>
                                </td>
                                <td className="p-5">
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-md uppercase ${item.category === 'Khuyến mãi' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {item.category}
                                    </span>
                                </td>
                                <td className="p-5 text-center whitespace-nowrap">
                                    <button onClick={() => startEdit(item)} className="bg-blue-50 text-blue-600 p-2 rounded-md font-black text-[10px] uppercase mr-2 hover:bg-blue-600 hover:text-white transition-all">Sửa</button>
                                    <button onClick={() => deleteItem(item._id)} className="bg-red-50 text-red-600 p-2 rounded-md font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all">Xóa</button>
                                </td>
                            </tr>
                        ))}
                        {news.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-10 text-center text-gray-400 font-bold uppercase text-xs">Chưa có bài viết nào trong hệ thống</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminNews;