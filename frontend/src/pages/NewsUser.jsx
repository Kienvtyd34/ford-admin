import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const NewsUser = () => {
    const [news, setNews] = useState([]);
    const [activeTab, setActiveTab] = useState('Tất cả');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const res = await api.get('/news');
                setNews(res.data.data);
            } catch (err) { 
                console.error(err); 
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, []);

    const categories = ['Tất cả', 'Tin tức', 'Khuyến mãi', 'Sự kiện', 'Đánh giá xe'];
    const filteredNews = activeTab === 'Tất cả' ? news : news.filter(n => n.category === activeTab);

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
    );

    return (
        <div className="bg-white min-h-screen">
            <div className="bg-[#002B5B] py-16 text-center text-white mb-12">
                <h1 className="text-4xl font-black uppercase tracking-tighter">Tin tức & Ưu đãi Ford</h1>
                <p className="opacity-70 mt-2 text-sm uppercase tracking-widest font-medium">Cập nhật thông tin mới nhất từ Ford Quế Võ</p>
            </div>

            <div className="container mx-auto px-6">
                <div className="flex flex-wrap justify-center gap-4 mb-12 border-b pb-6">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setActiveTab(cat)}
                            className={`px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-full border ${activeTab === cat ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'text-gray-500 border-gray-200 hover:border-red-600 hover:text-red-600'}`}>
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20">
                    {filteredNews.map((item) => (
                        <article key={item._id} className="group">
                            <Link to={`/tin-tuc/${item.slug}`}>
                                <div className="relative overflow-hidden rounded-2xl aspect-[16/10] mb-6 shadow-lg">
                                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 uppercase shadow-md">
                                        {item.category}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-gray-800 leading-tight group-hover:text-red-600 transition-colors uppercase line-clamp-2 mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-3 mb-4 leading-relaxed italic">
                                        {item.summary}
                                    </p>
                                    <span className="text-[#002B5B] font-black text-xs uppercase tracking-widest inline-flex items-center group-hover:translate-x-2 transition-transform">
                                        Khám phá ngay <span className="ml-2">→</span>
                                    </span>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>
                
                {filteredNews.length === 0 && (
                    <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-widest">
                        Chưa có bài viết nào trong mục này
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewsUser;