import React from 'react';
import { Link } from 'react-router-dom';

const InstallmentGuide = () => {
  return (
    <div className="bg-white min-h-screen">
      {/* Banner Header */}
      <div className="relative h-[400px] w-full bg-blue-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('https://www.ford.com.vn/content/dam/Ford/website-assets/ap/vn/news/2023/mua-xe-tra-gop/mua-xe-tra-gop-banner.jpg')] bg-cover bg-center"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-white text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 animate-in fade-in slide-in-from-bottom duration-700">
            Hướng Dẫn Mua Xe Ô Tô Trả Góp
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto font-medium">
            Sở hữu chiếc xe mơ ước với thủ tục đơn giản, lãi suất ưu đãi và quy trình nhanh chóng.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Section 1: Introduction */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-10 bg-blue-900"></div>
            <h2 className="text-3xl font-black text-blue-900 uppercase italic">Tôi có nên mua xe ô tô trả góp?</h2>
          </div>
          <p className="text-gray-700 leading-relaxed text-lg mb-6">
            Việc mua xe trả góp mang lại những lợi ích tuyệt vời. Bạn có thể sở hữu chiếc xe mình mong muốn mà không cần chi trả một khoản tiền lớn ngay lập tức, giúp tối ưu hóa dòng tiền cho các kế hoạch kinh doanh hoặc chi tiêu khác.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-10">
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-3xl mb-4 block">💰</span>
              <h4 className="font-bold text-blue-900 mb-2 uppercase">Vốn đầu tư thấp</h4>
              <p className="text-sm text-gray-600">Chỉ cần thanh toán trước 20% - 30% giá trị xe.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-3xl mb-4 block">📅</span>
              <h4 className="font-bold text-blue-900 mb-2 uppercase">Thời gian linh hoạt</h4>
              <p className="text-sm text-gray-600">Hỗ trợ vay lên đến 7-8 năm tùy điều kiện tài chính.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-3xl mb-4 block">⚡</span>
              <h4 className="font-bold text-blue-900 mb-2 uppercase">Thủ tục nhanh</h4>
              <p className="text-sm text-gray-600">Xét duyệt hồ sơ chỉ trong vòng 8 - 24 giờ làm việc.</p>
            </div>
          </div>
        </section>

        {/* Section 2: Requirements */}
        <section className="mb-16 bg-blue-50 rounded-3xl p-8 md:p-12 border border-blue-100">
          <h2 className="text-3xl font-black text-blue-900 uppercase italic mb-8">Điều kiện & Hồ sơ cần thiết</h2>
          <div className="grid md:grid-cols-2 gap-10">
            <div>
              <h4 className="font-black text-blue-800 uppercase text-sm mb-4 tracking-widest">Dành cho cá nhân</h4>
              <ul className="space-y-3">
                {['CCCD / Hộ chiếu còn hiệu lực', 'Giấy đăng ký kết hôn hoặc Giấy xác nhận độc thân', 'Hợp đồng lao động / Bảng lương 3-6 tháng gần nhất', 'Giấy tờ chứng minh thu nhập khác (nếu có)'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="text-blue-500 font-bold">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black text-blue-800 uppercase text-sm mb-4 tracking-widest">Dành cho doanh nghiệp</h4>
              <ul className="space-y-3">
                {['Giấy phép đăng ký kinh doanh', 'Báo cáo tài chính năm gần nhất', 'Tờ khai VAT 6 tháng gần nhất', 'CCCD của người đại diện pháp luật'].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <span className="text-blue-500 font-bold">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Section 3: Interest Rates */}
        <section className="mb-16">
          <h2 className="text-3xl font-black text-blue-900 uppercase italic mb-8">Lãi suất & Cách tính</h2>
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-8">
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h4 className="font-bold text-lg text-gray-800 mb-3 underline decoration-blue-500 underline-offset-4">Lãi suất cố định</h4>
                <p className="text-gray-600 text-sm italic">Lãi suất không đổi trong suốt thời gian vay hoặc một khoảng thời gian đầu (ví dụ 1 năm). Giúp bạn chủ động kế hoạch tài chính.</p>
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-800 mb-3 underline decoration-blue-500 underline-offset-4">Lãi suất thả nổi</h4>
                <p className="text-gray-600 text-sm italic">Điều chỉnh 3-6 tháng một lần theo biên độ thị trường. Phù hợp khi xu hướng lãi suất giảm.</p>
              </div>
            </div>
            <div className="mt-10 pt-10 border-t border-gray-100 text-center">
              <p className="text-gray-500 italic mb-6">Bạn muốn biết chính xác số tiền cần trả mỗi tháng?</p>
              <Link to="/lien-he" className="inline-block bg-blue-900 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest hover:bg-blue-800 transition-all shadow-xl hover:scale-105">
                Nhận báo giá & Tư vấn vay
              </Link>
            </div>
          </div>
        </section>
      </div>
      
      {/* Footer-like Call to Action */}
      <div className="bg-gray-900 py-20 text-center px-4">
        <h2 className="text-white text-3xl font-black uppercase italic mb-4">Sẵn sàng trải nghiệm xe Ford?</h2>
        <p className="text-gray-400 mb-10 max-w-xl mx-auto">Chúng tôi hỗ trợ liên kết với hơn 20 ngân hàng uy tín toàn quốc để mang lại mức lãi suất tốt nhất cho bạn.</p>
        <div className="flex flex-wrap justify-center gap-4">
           <Link to="/bang-gia" className="bg-white text-blue-900 px-8 py-3 rounded-lg font-bold uppercase text-sm">Xem bảng giá</Link>
           <Link to="/test-drive" className="bg-transparent border border-white text-white px-8 py-3 rounded-lg font-bold uppercase text-sm hover:bg-white hover:text-blue-900 transition-all">Đăng ký lái thử</Link>
        </div>
      </div>
    </div>
  );
};

export default InstallmentGuide;