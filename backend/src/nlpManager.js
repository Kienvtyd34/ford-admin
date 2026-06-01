import VehicleModel from './models/VehicleModel.js';
import Variant from './models/Variant.js';

export function removeVietnameseTones(str) {
    if (!str) return '';
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|á|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    return str.trim();
}

// Map từ khóa tiếng Việt sang key logic trong trường "features" của Variant Model
const FEATURE_KEYWORDS = {
    'cua so troi': 'sunroof',
    'sunroof': 'sunroof',
    'camera 360': 'camera360',
    'cam 360': 'camera360',
    'phanh tu dong': 'autoEmergencyBrake',
    'giu lan': 'laneKeepAssist',
    'canh bao diem mu': 'blindSpot',
    'thich ung': 'adaptiveCruise',
    'sac khong day': 'wirelessCharging',
    'cop dien': 'powerTailgate',
    'den tu dong': 'autoHeadlamp',
    'gat mua tu dong': 'autoWiper',
    'den noi that': 'ambientLight',
    'ambient light': 'ambientLight',
    'ghe da': 'leatherSeat',
    'lam mat ghe': 'ventilatedSeat',
    'suoi ghe': 'heatedSeat',
    'ghe dien': 'powerDriverSeat',
    'fordpass': 'fordPass',
    'am thanh cao cap': 'premiumAudio'
};

export async function analyzeMessage(message) {
    const cleanMsg = removeVietnameseTones(message);
    
    let intent = 'unknown';
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

    // 1. Tìm số khung VIN (Ví dụ: WF0RC6AOYBXYC)
    const vinMatch = message.toUpperCase().match(/[A-Z0-9]{12,17}/);
    if (vinMatch) entities.vin = vinMatch[0];

    // 2. Phân tích tài chính / ngân sách
    const budgetMatch = cleanMsg.match(/(\d+)\s*(trieu|tr|ty)/);
    if (budgetMatch) {
        let value = parseInt(budgetMatch[1]);
        let unit = budgetMatch[2];
        entities.budget = (unit === 'ty') ? value * 1000000000 : value * 1000000;
    } else if (cleanMsg.includes('duoi 1 ty')) {
        entities.budget = 950000000;
    } else if (cleanMsg.includes('2 ty')) {
        entities.budget = 2000000000;
    }

    // 3. Phân tích quy mô chỗ ngồi / gia đình
    if (cleanMsg.match(/(5\s*cho|5\s*nguoi|nha\s*5)/)) {
        entities.familySize = 5;
    } else if (cleanMsg.match(/(7\s*cho|7\s*nguoi|dong\s*nguoi|nha\s*7)/)) {
        entities.familySize = 7;
    }

    // 4. Phân tích mục đích vận hành
    if (cleanMsg.includes('cong truong') || cleanMsg.includes('cong trinh') || cleanMsg.includes('offroad') || cleanMsg.includes('dia hinh')) {
        entities.purpose = 'offroad';
    } else if (cleanMsg.includes('cho hang') || cleanMsg.includes('ban tai') || cleanMsg.includes('cho do')) {
        entities.purpose = 'cargo';
    } else if (cleanMsg.includes('di pho') || cleanMsg.includes('nhe nhang') || cleanMsg.includes('tiet kiem')) {
        entities.purpose = 'city';
    }

    // 5. Phân tích tính năng xe (Features)
    for (let keyword in FEATURE_KEYWORDS) {
        if (cleanMsg.includes(keyword)) {
            entities.feature = FEATURE_KEYWORDS[keyword];
            break;
        }
    }

    // 6. Nhận diện màu sắc
    const colors = ['den', 'trang', 'do', 'bac', 'xam', 'xanh'];
    for (let c of colors) {
        if (cleanMsg.includes(`mau ${c}`) || cleanMsg.includes(`xe ${c}`)) {
            entities.color = c;
            break;
        }
    }

    // 7. Khớp từ khóa Model & Variant động từ Database
    const models = await VehicleModel.find({});
    for (let m of models) {
        const cleanName = removeVietnameseTones(m.name);
        if (cleanMsg.includes(cleanName) || (m.aliases && m.aliases.some(a => cleanMsg.includes(removeVietnameseTones(a))))) {
            entities.modelName = m.name;
        }
    }

    const variants = await Variant.find({});
    for (let v of variants) {
        if (cleanMsg.includes(removeVietnameseTones(v.variantName)) || (v.aliases && v.aliases.some(a => cleanMsg.includes(removeVietnameseTones(a))))) {
            entities.variantName = v.variantName;
            break;
        }
    }

    // 8. Định vị Intent chuẩn hóa
    if (entities.budget || entities.familySize || entities.purpose) {
        intent = 'tu_van_theo_nhu_cau';
    } else if (cleanMsg.includes('loi') || cleanMsg.includes('hu') || cleanMsg.includes('giat so') || cleanMsg.includes('den ca vang') || cleanMsg.includes('u3000')) {
        intent = 'hoi_su_co_ky_thuat';
    } else if (cleanMsg.includes('co nhung mau') || cleanMsg.includes('mau gi') || cleanMsg.includes('anh xe') || cleanMsg.includes('hinh anh')) {
        intent = 'hoi_danh_sach_mau';
    } else if (cleanMsg.includes('con kho') || cleanMsg.includes('co san') || cleanMsg.includes('giao ngay') || cleanMsg.includes('ton kho') || entities.vin) {
        intent = 'hoi_ton_kho';
    } else if (cleanMsg.includes('gia bao nhieu') || cleanMsg.includes('xin gia') || cleanMsg.includes('gia ban') || cleanMsg.includes('gia niem yet') || cleanMsg.includes('gia nhiu') || cleanMsg.includes('bn')) {
        intent = 'hoi_gia';
    } else if (entities.feature || cleanMsg.includes('thong so') || cleanMsg.includes('chay bang') || cleanMsg.includes('dong co') || cleanMsg.includes('hop so')) {
        intent = 'hoi_thong_so_tinh_nang';
    } else if (cleanMsg.includes('khuyen mai') || cleanMsg.includes('su kien') || cleanMsg.includes('tin tuc') || cleanMsg.includes('bai viet')) {
        intent = 'hoi_tin_tuc_su_kien';
    }

    return { intent, entities };
}