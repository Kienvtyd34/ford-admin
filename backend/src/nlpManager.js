import stringSimilarity from 'string-similarity';
import VehicleModel from './models/VehicleModel.js';
import Variant from './models/Variant.js';

// Khởi tạo bộ nhớ Context Memory lưu theo Session/User (Mô phỏng trong bộ nhớ RAM)
const contextMemory = new Map();

// Hàm chuẩn hóa dữ liệu văn bản (Tiền xử lý)
export function cleanText(str) {
    if (!str) return '';
    str = str.toLowerCase();
    str = str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, ""); // Loại bỏ ký tự đặc biệt
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|á|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str.trim();
}

// Từ điển ánh xạ các thực thể tính năng (Entity Mapping)
const FEATURE_DICTIONARY = {
    'sunroof': ['cua so troi', 'sunroof', 'cua troi'],
    'camera360': ['camera 360', 'cam 360', 'camera toan canh'],
    'autoEmergencyBrake': ['phanh tu dong', 'phanh khan cap', 'aeb'],
    'laneKeepAssist': ['giu lan', 'ho tro giu lan', 'lech lan'],
    'blindSpot': ['diem mu', 'canh bao diem mu', 'bsis'],
    'adaptiveCruise': ['ga tu dong thich ung', 'acc', 'adaptive cruise', 'bam duoi xe truoc'],
    'wirelessCharging': ['sac khong day', 'sac dt khong day'],
    'powerTailgate': ['cop dien', 'da cop', 'mo cop tu dong'],
    'leatherSeat': ['ghe da', 'boc da'],
    'ventilatedSeat': ['lam mat ghe', 'thong gio ghe', 'ghe lam mat']
};

export async function processSemanticAI(userId, message) {
    const rawClean = cleanText(message);
    
    // Khởi tạo cấu trúc dữ liệu đầu ra của tầng NLP
    let intent = 'UNKNOWN';
    let entities = {
        modelName: null,
        variantName: null,
        color: null,
        feature: null,
        budget: null,
        familySize: null,
        purpose: null,
        vin: null
    };

    // Lấy ngữ cảnh cũ từ Context Memory (Multi-turn Conversation)
    const userContext = contextMemory.get(userId) || { lastModel: null, lastVariant: null };

    // 1. Entity Extraction: Số khung VIN
    const vinMatch = message.toUpperCase().match(/[A-Z0-9]{12,17}/);
    if (vinMatch) entities.vin = vinMatch[0];

    // 2. Entity Extraction: Khoảng giá / Ngân sách
    const budgetMatch = rawClean.match(/(\d+)\s*(trieu|tr|ty)/);
    if (budgetMatch) {
        let val = parseInt(budgetMatch[1]);
        let unit = budgetMatch[2];
        entities.budget = (unit === 'ty') ? val * 1000000000 : val * 1000000;
    }

    // 3. Entity Extraction: Quy mô chỗ ngồi
    if (rawClean.match(/(5\s*cho|5\s*nguoi)/)) entities.familySize = 5;
    if (rawClean.match(/(7\s*cho|7\s*nguoi)/)) entities.familySize = 7;

    // 4. Entity Extraction: Tính năng (Semantic Feature Matching)
    for (let [key, synonyms] of Object.entries(FEATURE_DICTIONARY)) {
        if (synonyms.some(syn => rawClean.includes(syn))) {
            entities.feature = key;
            break;
        }
    }

    // 5. Entity Extraction: Màu sắc xe
    const colorList = ['den', 'trang', 'do', 'bac', 'xam', 'xanh'];
    for (let col of colorList) {
        if (rawClean.includes(`mau ${col}`) || rawClean.includes(`xe ${col}`)) {
            entities.color = col;
            break;
        }
    }

    // 6. Entity Extraction: Nhận diện Dòng xe & Phiên bản từ DB
    const allModels = await VehicleModel.find({});
    for (let m of allModels) {
        const cleanMName = cleanText(m.name);
        if (rawClean.includes(cleanMName) || (m.aliases && m.aliases.some(a => rawClean.includes(cleanText(a))))) {
            entities.modelName = m.name;
            userContext.lastModel = m.name; // Cập nhật bộ nhớ ngữ cảnh
        }
    }

    const allVariants = await Variant.find({});
    for (let v of allVariants) {
        const cleanVName = cleanText(v.variantName);
        if (rawClean.includes(cleanVName) || (v.aliases && v.aliases.some(a => rawClean.includes(cleanText(a))))) {
            entities.variantName = v.variantName;
            userContext.lastVariant = v.variantName; // Cập nhật bộ nhớ ngữ cảnh
            break;
        }
    }

    // ÁP DỤNG CONTEXT MEMORY: Nếu câu hỏi khuyết thiếu Thực thể xe, lấy từ lượt hội thoại trước
    if (!entities.modelName && userContext.lastModel) {
        entities.modelName = userContext.lastModel;
    }
    if (!entities.variantName && userContext.lastVariant) {
        entities.variantName = userContext.lastVariant;
    }

    // Lưu lại trạng thái ngữ cảnh mới nhất vào bộ nhớ RAM
    contextMemory.set(userId, userContext);

    // 7. Intent Detection: Phân tích Ý định dựa trên Semantic Keywords
    if (entities.budget || entities.familySize) {
        intent = 'ADVISORY_QUERY'; // Tư vấn dòng xe phù hợp
    } else if (rawClean.includes('loi') || rawClean.includes('hu') || rawClean.includes('giat so') || rawClean.includes('u3000') || rawClean.includes('den ca vang')) {
        intent = 'TECHNICAL_SUPPORT'; // Hỗ trợ kỹ thuật / Sự cố
    } else if (rawClean.includes('mau gi') || rawClean.includes('co nhung mau') || rawClean.includes('co mau')) {
        intent = 'COLOR_QUERY'; // Tra cứu danh mục bảng màu
    } else if (rawClean.includes('con kho') || rawClean.includes('co san') || rawClean.includes('giao ngay') || entities.vin) {
        intent = 'STOCK_QUERY'; // Kiểm tra tồn kho hàng hóa
    } else if (rawClean.includes('gia bao nhieu') || rawClean.includes('xin gia') || rawClean.includes('gia niem yet') || rawClean.includes('bn') || rawClean.includes('nhiu')) {
        intent = 'PRICE_QUERY'; // Tra cứu giá xe
    } else if (entities.feature || rawClean.includes('thong so') || rawClean.includes('dong co') || rawClean.includes('hop so')) {
        intent = 'SPECS_QUERY'; // Tra cứu thông số & tính năng
    } else if (rawClean.includes('khuyen mai') || rawClean.includes('su kien') || rawClean.includes('tin tuc')) {
        intent = 'NEWS_QUERY'; // Tra cứu tin tức sự kiện khuyến mãi
    }

    return { intent, entities };
}