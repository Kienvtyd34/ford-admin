import stringSimilarity from 'string-similarity';
import VehicleModel from './models/VehicleModel.js';
import Variant from './models/Variant.js';

// Khởi tạo bộ nhớ Context Memory lưu theo Session/User
const contextMemory = new Map();

export function cleanText(str) {
    if (!str) return '';
    str = str.toLowerCase();
    str = str.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|á|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str.trim();
}

const FEATURE_DICTIONARY = {
    'sunroof': ['cua so troi', 'sunroof', 'cua troi'],
    'camera360': ['camera 360', 'cam 360', 'camera toan canh'],
    'autoEmergencyBrake': ['phanh tu dong', 'phanh khan cap', 'aeb'],
    'laneKeepAssist': ['giu lan', 'ho tro giu lan', 'lech lan'],
    'blindSpot': ['diem mu', 'canh bao diem mu', 'bsis'],
    'adaptiveCruise': ['ga tu dong thich ung', 'acc', 'adaptive cruise'],
    'wirelessCharging': ['sac khong day', 'sac dt khong day'],
    'powerTailgate': ['cop dien', 'da cop', 'mo cop tu dong']
};

export async function processSemanticAI(userId, message) {
    const rawClean = cleanText(message);
    
    let intent = 'UNKNOWN';
    let entities = {
        modelName: null, variantName: null, color: null,
        feature: null, budget: null, familySize: null, vin: null
    };

    // Lấy ngữ cảnh cũ từ Context Memory
    const userContext = contextMemory.get(userId) || { lastModel: null, lastVariant: null };

    // 1. Trích xuất các thực thể cơ bản
    const vinMatch = message.toUpperCase().match(/[A-Z0-9]{12,17}/);
    if (vinMatch) entities.vin = vinMatch[0];

    const budgetMatch = rawClean.match(/(\d+)\s*(trieu|tr|ty)/);
    if (budgetMatch) {
        let val = parseInt(budgetMatch[1]);
        entities.budget = (budgetMatch[2] === 'ty') ? val * 1000000000 : val * 1000000;
    }

    if (rawClean.match(/(5\s*cho|5\s*nguoi)/)) entities.familySize = 5;
    if (rawClean.match(/(7\s*cho|7\s*nguoi)/)) entities.familySize = 7;

    for (let [key, synonyms] of Object.entries(FEATURE_DICTIONARY)) {
        if (synonyms.some(syn => rawClean.includes(syn))) {
            entities.feature = key;
            break;
        }
    }

    const colorList = ['den', 'trang', 'do', 'bac', 'xam', 'xanh'];
    for (let col of colorList) {
        if (rawClean.includes(`mau ${col}`) || rawClean.includes(`xe ${col}`)) {
            entities.color = col;
            break;
        }
    }

    // 2. Trích xuất tên dòng xe & phiên bản từ DB
    let foundModelInMsg = false;
    const allModels = await VehicleModel.find({});
    for (let m of allModels) {
        const cleanMName = cleanText(m.name);
        if (rawClean.includes(cleanMName) || (m.aliases && m.aliases.some(a => rawClean.includes(cleanText(a))))) {
            entities.modelName = m.name;
            userContext.lastModel = m.name; // Cập nhật bộ nhớ
            foundModelInMsg = true;
        }
    }

    let foundVariantInMsg = false;
    const allVariants = await Variant.find({});
    for (let v of allVariants) {
        const cleanVName = cleanText(v.variantName);
        if (rawClean.includes(cleanVName) || (v.aliases && v.aliases.some(a => rawClean.includes(cleanText(a))))) {
            entities.variantName = v.variantName;
            userContext.lastVariant = v.variantName; // Cập nhật bộ nhớ
            foundVariantInMsg = true;
            break;
        }
    }

    // 🌟 QUẢN LÝ NGỮ CẢNH ĐA LƯỢT (Multi-turn Context Memory)
    // Nếu lượt này người dùng KHÔNG nhắc đến tên xe, kế thừa lại thực thể từ lượt trước
    if (!foundModelInMsg && userContext.lastModel) {
        entities.modelName = userContext.lastModel;
    }
    if (!foundVariantInMsg && userContext.lastVariant) {
        entities.variantName = userContext.lastVariant;
    }

    // Lưu lại trạng thái cập nhật vào RAM
    contextMemory.set(userId, userContext);

    // 3. Phân tích ý định (Intent Detection) - Khớp với mục 1.1.5 trong báo cáo
    if (rawClean.includes('tra gop') || rawClean.includes('vay ngan hang') || rawClean.includes('lai suat')) {
        intent = 'INSTALLMENT_QUERY'; // Thêm mới Intent Tư vấn trả góp đúng báo cáo
    } else if (entities.budget || entities.familySize) {
        intent = 'ADVISORY_QUERY'; 
    } else if (rawClean.includes('loi') || rawClean.includes('hu') || rawClean.includes('giat so') || rawClean.includes('u3000') || rawClean.includes('den ca vang')) {
        intent = 'TECHNICAL_SUPPORT'; 
    } else if (rawClean.includes('mau gi') || rawClean.includes('co nhung mau') || rawClean.includes('co mau')) {
        intent = 'COLOR_QUERY'; 
    } else if (rawClean.includes('con kho') || rawClean.includes('co san') || rawClean.includes('giao ngay') || entities.vin) {
        intent = 'STOCK_QUERY'; 
    } else if (rawClean.includes('gia bao nhieu') || rawClean.includes('xin gia') || rawClean.includes('gia niem yet') || rawClean.includes('bn') || rawClean.includes('nhiu')) {
        intent = 'PRICE_QUERY'; // Khớp mã PRICE_QUERY trong ví dụ mục 1.1.5 của bạn
    } else if (entities.feature || rawClean.includes('thong so') || rawClean.includes('dong co') || rawClean.includes('hop so')) {
        intent = 'SPECS_QUERY'; 
    } else if (rawClean.includes('khuyen mai') || rawClean.includes('su kien') || rawClean.includes('tin tuc')) {
        intent = 'NEWS_QUERY'; 
    }

    return { intent, entities };
}