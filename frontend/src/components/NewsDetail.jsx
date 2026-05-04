import React, { useState, useEffect,useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Eye, ArrowLeft, Share2, Tag } from 'lucide-react';
import api from '../api/axios';

const NewsDetail = () => {
    const { slug } = useParams();
    const [news, setNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const isFetched = useRef(false);

    useEffect(() => {
        // Nếu đã gọi rồi thì không gọi nữa
        if (isFetched.current) return;

        const fetchNewsDetail = async () => {
            try {
                setLoading(true);
                const res = await api.get(`/news/${slug}`);
                setNews(res.data.data);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                
                // Đánh dấu đã lấy dữ liệu thành công
                isFetched.current = true; 
            } catch (err) {
                console.error("Lỗi:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNewsDetail();
        
        // Cleanup function (tùy chọn)
        return () => {
            // Nếu bạn muốn mỗi lần đổi slug lại cho phép fetch:
            // isFetched.current = false;
        };
    }, [slug]);

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#002B5B]"></div>
        </div>
    );

    if (!news) return (
        <div className="text-center py-40">
            <h2 className="text-2xl font-black uppercase text-gray-800">Không tìm thấy bài viết</h2>
            <Link to="/tin-tuc" className="text-red-600 font-bold hover:underline mt-6 inline-block uppercase tracking-widest text-sm">
                ← Quay lại danh sách tin tức
            </Link>
        </div>
    );

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Thanh điều hướng nhanh */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link to="/tin-tuc" className="flex items-center text-gray-600 hover:text-red-600 transition-colors font-bold text-xs uppercase tracking-widest">
                        <ArrowLeft size={18} className="mr-2" /> Quay lại tin tức
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-1.5 border rounded-full hover:bg-gray-50 transition-colors text-xs font-bold text-gray-600 uppercase">
                        <Share2 size={16} /> Chia sẻ
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header Bài viết */}
                    <div className="mb-10 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                            <span className="bg-red-600 text-white text-[10px] font-black px-4 py-1 uppercase tracking-widest">
                                {news.category}
                            </span>
                            <span className="text-gray-400 text-xs font-bold flex items-center uppercase tracking-widest">
                                <Calendar size={14} className="mr-1.5 text-red-600" />
                                {new Date(news.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                        
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight uppercase italic mb-8">
                            {news.title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 text-gray-500 text-[11px] font-black uppercase tracking-widest border-y py-4">
                            <div className="flex items-center">
                                <User size={16} className="mr-2 text-red-600" />
                                Tác giả: <span className="ml-1 text-gray-900">{news.author}</span>
                            </div>
                            <div className="flex items-center">
                                <Eye size={16} className="mr-2 text-red-600" />
                                {news.views?.toLocaleString()} lượt xem
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail chính */}
                    <div className="rounded-3xl overflow-hidden shadow-2xl mb-12 border-b-8 border-red-600">
                        <img src={news.thumbnail} alt={news.title} className="w-full h-auto object-cover" />
                    </div>

                    {/* Tóm tắt */}
                    <div className="bg-white border-l-8 border-[#002B5B] p-8 mb-12 shadow-sm italic text-xl text-gray-700 leading-relaxed font-medium">
                        {news.summary}
                    </div>

                    {/* Nội dung Render từ CMS Editor */}
                    <div className="prose prose-lg max-w-none text-gray-800 leading-loose mb-16 px-2 md:px-0 news-detail-content">
                        <div dangerouslySetInnerHTML={{ __html: news.content }} />
                    </div>

                    {/* Gallery Hình ảnh chi tiết */}
                    {news.images && news.images.length > 0 && (
                        <div className="mt-20 border-t pt-10">
                            <h3 className="text-2xl font-black mb-10 flex items-center uppercase italic">
                                <span className="w-12 h-1.5 bg-red-600 mr-4"></span>
                                Góc nhìn thực tế
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {news.images.map((img, index) => (
                                    <div key={index} className="rounded-2xl overflow-hidden shadow-xl group cursor-zoom-in">
                                        <img 
                                            src={img} 
                                            alt={`Chi tiết ${index + 1}`} 
                                            className="w-full h-72 object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer / Keywords */}
                    <div className="mt-20 pt-10 border-t-2 border-dashed flex flex-wrap justify-between items-center gap-6">
                        <div className="flex items-center text-gray-500 bg-gray-100 px-4 py-2 rounded-lg">
                            <Tag size={18} className="mr-2 text-red-600" />
                            <span className="text-[11px] font-black uppercase tracking-widest">
                                Tags: Ford Quế Võ, {news.category}, Tin xe 24h
                            </span>
                        </div>
                        <div className="flex gap-4">
                            <button className="bg-[#1877F2] text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-tighter hover:shadow-lg transition-all">Facebook</button>
                            <button className="bg-black text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-tighter hover:shadow-lg transition-all">Zalo Share</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsDetail;