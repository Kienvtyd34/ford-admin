import stringSimilarity from 'string-similarity';
import VehicleModel from './models/VehicleModel.js'; // Bạn nhớ điều chỉnh lại đường dẫn file model cho đúng nhé

/**
 * Hàm gọt giũa và chuẩn hóa văn bản đầu vào chuyên sâu
 */
export const cleanText = (text) => {
    if (!text) return "";
    return text.toLowerCase()
               .trim()
               .replace(/^\d+[\.\s\-]+/g, "") // 🛠️ XÓA SỐ THỨ TỰ (Ví dụ: "36. Kho mình..." thành "kho mình...")
               .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ") // Biến toàn bộ ký tự đặc biệt thành khoảng trắng
               .replace(/\s+/g, " "); // Thu gọn khoảng trắng thừa thành 1 khoảng trắng duy nhất
};

/**
 * Tầng xử lý ngôn ngữ tự nhiên nội bộ - Không phụ thuộc API bên ngoài
 */
export const processSemanticAI = async (userId, rawMessage) => {
    const message = cleanText(rawMessage);
    
    let intent = 'DEFAULT';
    let entities = {
        modelName: null,
        variantName: null
    };

    // =========================================================
    // 1. PHÂN LOẠI Ý ĐỊNH MỞ RỘNG (INTENT CLUSTERING)
    // =========================================================
    const intentKeywords = {
        'PRICE_QUERY': [
            'giá', 'gia', 'bao nhiêu', 'bao nhieu', 'báo giá', 'bao gia', 
            'mức giá', 'nhiêu tiền', 'đắt không', 'dat khong', 'hết bao nhiêu', 
            'het bao nhieu', 'tốn bao nhiêu', 'chi phí mua', 'tiền mua'
        ],
        'INSTALLMENT_QUERY': [
            'trả góp', 'tra gop', 'vay', 'ngân hàng', 'ngan hang', 'lãi suất', 
            'lai suat', 'cần tiền mua', 'can tien mua', 'gói vay', 'tín dụng', 
            'thủ tục mua', 'trả trước bao nhiêu', 'tra truoc bao nhieu'
        ],
        'STOCK_QUERY': [
            'kho', 'bãi', 'sẵn không', 'san khong', 'còn xe', 'con xe', 
            'giao ngay', 'giao luon', 'có xe', 'co xe', 'đại lý', 'sẵn hàng'
        ],
        'SPECS_QUERY': [
            'thông số', 'thong so', 'tính năng', 'tinh nang', 'động cơ', 
            'hộp số', 'mã lực', 'specs', 'thiết kế', 'option', 'máy xăng', 'máy dầu'
        ]
    };

    // Duyệt cụm từ thông minh: Chỉ cần dính 1 từ mồi là lập tức kích hoạt Intent
    for (const [key, keywords] of Object.entries(intentKeywords)) {
        if (keywords.some(keyword => message.includes(keyword))) {
            intent = key;
            break;
        }
    }

    // =========================================================
    // 2. NHẬN DIỆN DÒNG XE TỰ ĐỘNG TỪ DATABASE (DATABASE-DRIVEN ENTIY)
    // =========================================================
    try {
        // Lấy tất cả các dòng xe hiện có trong DB (Everest, Ranger, Mustang Mach-E...)
        const allModels = await VehicleModel.find({}, 'name');
        let bestMatchModel = null;
        let highestScore = 0;

        for (const model of allModels) {
            const modelNameLower = model.name.toLowerCase();
            
            // Chiến thuật 1: Khớp tuyệt đối chuỗi con (Chính xác cao nhất)
            if (message.includes(modelNameLower)) {
                bestMatchModel = model.name;
                highestScore = 1.0;
                break; // Tìm thấy từ khóa trực tiếp thì dừng quét luôn
            }
            
            // Chiến thuật 2: Khớp mờ từ viết tắt (Ví dụ: "mach-e" khớp vào "Mustang Mach-E")
            const words = modelNameLower.split(' '); // Tách từ cấu trúc tên gốc
            if (words.some(word => word.length > 2 && message.includes(word))) {
                bestMatchModel = model.name;
                highestScore = 0.9;
                break;
            }

            // Chiến thuật 3: Quét khoảng cách chuỗi phòng trường hợp sai chính tả nhẹ
            const score = stringSimilarity.compareTwoStrings(message, modelNameLower);
            if (score > highestScore && score > 0.20) { // Ngưỡng an toàn thấp 0.20 để bao quát rộng
                highestScore = score;
                bestMatchModel = model.name;
            }
        }

        if (bestMatchModel) {
            entities.modelName = bestMatchModel;
        }
    } catch (err) {
        console.error("❌ Lỗi quét danh mục xe NLP nội bộ:", err);
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
            // Chuẩn hóa chữ hoa giống cách lưu trữ của bạn trong bảng Variant
            entities.variantName = v.toUpperCase(); 
            break;
        }
    }

    return { intent, entities };
};