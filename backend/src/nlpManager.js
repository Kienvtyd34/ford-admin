import stringSimilarity from 'string-similarity';
import VehicleModel from './models/VehicleModel.js'; // Điều chỉnh đường dẫn cho đúng với cấu trúc thư mục của bạn

/**
 * Hàm gọt giũa và chuẩn hóa văn bản đầu vào chuyên sâu
 * - Chuyển về chữ thường, xóa khoảng trắng thừa.
 * - Xóa bỏ hoàn toàn số thứ tự bài test ở đầu câu (Ví dụ: "16. ", "36. ", "36- ", "36 ")
 * - Chuyển đổi các ký tự đặc biệt phổ biến tránh làm nhiễu biểu thức so sánh
 */
export const cleanText = (text) => {
    if (!text) return "";
    return text.toLowerCase()
               .trim()
               .replace(/^\d+[\.\s\-]+/g, "") // Gọt sạch "16. ", "36. " ở đầu câu
               .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ") // Thay thế ký tự đặc biệt thành khoảng trắng
               .replace(/\s+/g, " "); // Thu gọn chuỗi khoảng trắng liền nhau thành 1 khoảng trắng đơn
};

/**
 * Tầng xử lý ngôn ngữ tự nhiên nội bộ (Không sử dụng API bên ngoài)
 * Phân tích cú pháp câu hỏi của khách hàng để bóc tách Ý định (Intent) và Thực thể (Entities)
 */
export const processSemanticAI = async (userId, rawMessage) => {
    const message = cleanText(rawMessage);
    
    // Khởi tạo cấu trúc dữ liệu trả ra mặc định khớp với Controller dữ liệu của bạn
    let intent = 'DEFAULT';
    let entities = {
        modelName: null,
        variantName: null,
        feature: null
    };

    // =========================================================
    // 1. MA TRẬN PHÂN LOẠI Ý ĐỊNH BAO QUÁT (INTENT CLUSTERING)
    // =========================================================
    const intentKeywords = {
        // Ý định tra cứu giá xe / báo giá công bố
        'PRICE_QUERY': [
            'giá', 'gia', 'bao nhiêu', 'bao nhieu', 'báo giá', 'bao gia', 
            'mức giá', 'nhiêu tiền', 'đắt không', 'dat khong', 'hết bao nhiêu', 
            'het bao nhieu', 'tốn bao nhiêu', 'chi phí mua', 'tiền mua', 'bán nhiêu'
        ],
        // Ý định tư vấn ngân hàng, vay vốn, tính gốc lãi trả góp
        'INSTALLMENT_QUERY': [
            'trả góp', 'tra gop', 'vay', 'ngân hàng', 'ngan hang', 'lãi suất', 
            'lai suat', 'cần tiền mua', 'can tien mua', 'gói vay', 'tín dụng', 
            'thủ tục mua', 'trả trước bao nhiêu', 'tra truoc bao nhieu', 'bảng tính vay'
        ],
        // Ý định check tình trạng kho bãi, số lượng xe sẵn sàng giao ngay
        'STOCK_QUERY': [
            'kho', 'bãi', 'sẵn không', 'san khong', 'còn xe', 'con xe', 
            'giao ngay', 'giao luon', 'có xe', 'co xe', 'đại lý', 'sẵn hàng', 'giao tuần này'
        ],
        // Ý định hỏi về thông số kỹ thuật, trang bị, option hoặc các tính năng của xe
        'SPECS_QUERY': [
            'thông số', 'thong so', 'tính năng', 'tinh nang', 'động cơ', 'hộp số', 
            'mã lực', 'specs', 'thiết kế', 'option', 'máy xăng', 'máy dầu',
            'trang bị', 'trang bi', 'tích hợp', 'phanh tay', 'cảm biến', 'lốp', 'vành', 'lazang',
            // Thêm các từ khóa option thực tế để kích hoạt ngay intent SPECS_QUERY khi khách hỏi trực tiếp
            'cửa sổ trời', 'cua so troi', 'camera 360', 'cam 360', 'màn hình', 'man hinh', 'ghế da', 'ghe da'
        ],
        // Ý định chẩn đoán hư hỏng, hỗ trợ kỹ thuật và bắt lỗi vận hành (Sử dụng Model CarProblem)
        'TECHNICAL_SUPPORT': [
            'lỗi', 'loi', 'hỏng', 'hong', 'sự cố', 'su co', 'không nổ được', 'khong no duoc',
            'kêu', 'keu', 'khói', 'khoi', 'chảy dầu', 'chay dau', 'báo lỗi', 'bao loi',
            'vô lăng nặng', 'vo lang nang', 'nhiệt độ cao', 'nhiet do cao', 'chẩn đoán', 'bị sao', 'bi sao'
        ]
    };

    // Bước quét 1: Kiểm tra từ khóa mồi nhóm Intent
    for (const [key, keywords] of Object.entries(intentKeywords)) {
        if (keywords.some(keyword => message.includes(keyword))) {
            intent = key;
            break;
        }
    }

    // Bước quét 2: Đánh bẫy ngữ cảnh câu hỏi nghi vấn dạng "có... không" hoặc "có... ko" 
    // Nếu hệ thống vẫn đang ở 'DEFAULT' mà người dùng dùng cấu hình câu hỏi này thì tự động gom về hỏi option (SPECS_QUERY)
    if (intent === 'DEFAULT' && message.includes("có") && (message.includes("không") || message.includes("ko"))) {
        intent = 'SPECS_QUERY';
    }

    // =========================================================
    // 2. NHẬN DIỆN THỰC THỂ DÒNG XE TỰ ĐỘNG (DATABASE-DRIVEN ENTITY)
    // =========================================================
    try {
        // Lấy danh sách tên dòng xe thực tế đang quản lý trong database
        const allModels = await VehicleModel.find({}, 'name');
        let bestMatchModel = null;
        let highestScore = 0;

        for (const model of allModels) {
            const modelNameLower = model.name.toLowerCase();
            
            // Tuyến 1: Khớp chuỗi con chính xác (Ưu tiên số 1 - Ví dụ: gõ "everest" trúng ngay "Ford Everest")
            if (message.includes(modelNameLower)) {
                bestMatchModel = model.name;
                highestScore = 1.0;
                break; 
            }
            
            // Tuyến 2: Khớp mờ từ viết tắt độc lập (Ví dụ: khách gõ "mach-e" vẫn khớp trúng dòng "Mustang Mach-E")
            const words = modelNameLower.split(' ');
            if (words.some(word => word.length > 2 && message.includes(word))) {
                bestMatchModel = model.name;
                highestScore = 0.9;
                break;
            }

            // Tuyến 3: So sánh khoảng cách chuỗi (Fuzzy Match) đề phòng người dùng gõ sai chính tả nhẹ (Ví dụ: "everes", "rannger")
            const score = stringSimilarity.compareTwoStrings(message, modelNameLower);
            if (score > highestScore && score > 0.20) { // Đặt ngưỡng bao quát rộng 0.20
                highestScore = score;
                bestMatchModel = model.name;
            }
        }

        if (bestMatchModel) {
            entities.modelName = bestMatchModel;
        }
    } catch (err) {
        console.error("❌ Lỗi đồng bộ dữ liệu NLP tại VehicleModel:", err);
    }

    // =========================================================
    // 3. BÓC TÁCH PHIÊN BẢN XE (VARIANT EXTRACTION)
    // =========================================================
    const commonVariants = [
        'titanium x', 'titanium', 'wildtrak', 'sport', 'premium', 
        'xls', 'xlt', 'ambient', 'raptor', 'platinum', 'trend'
    ];
    
    for (const v of commonVariants) {
        if (message.includes(v)) {
            // Chuyển chữ hoa (.toUpperCase()) để khớp chính xác cấu hình lưu trữ của bảng Variant trong DB của bạn
            entities.variantName = v.toUpperCase(); 
            break;
        }
    }

    // =========================================================
    // 4. BÓC TÁCH TÍNH NĂNG TỰ ĐỘNG (FEATURE EXTRACTION)
    // =========================================================
    // Từ khóa người dùng gõ -> Tên field thuộc tính trong cấu trúc Schema "Variant.features" của bạn.
    // Bạn hãy chỉnh sửa các giá trị chuỗi bên tay phải (ví dụ: 'sunroof', 'camera360') 
    // sao cho khớp 100% với tên trường thuộc tính kiểu Boolean trong DB của bạn nhé.
    const featureMap = {
        'cửa sổ trời': 'sunroof',
        'cua so troi': 'sunroof',
        'camera 360': 'camera360',
        'cam 360': 'camera360',
        'màn hình': 'screen',
        'man hinh': 'screen',
        'ghế da': 'leatherSeats',
        'ghe da': 'leatherSeats',
        'phanh tay điện tử': 'electronicParkingBrake',
        'phanh tay': 'electronicParkingBrake',
        'sạc không dây': 'wirelessCharger',
        'sac khong day': 'wirelessCharger'
    };

    for (const [userKeyword, dbFieldName] of Object.entries(featureMap)) {
        if (message.includes(userKeyword)) {
            entities.feature = dbFieldName;
            break; // Tìm thấy tính năng đầu tiên khớp thì dừng bộ lọc
        }
    }

    return { intent, entities };
};