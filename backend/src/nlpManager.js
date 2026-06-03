import stringSimilarity from 'string-similarity';
import VehicleModel from './models/VehicleModel.js';

export const cleanText = (text) => {
    if (!text) return "";
    return text.toLowerCase()
               .trim()
               .replace(/^\d+[\.\s\-]+/g, "") // Xóa bỏ số thứ tự kịch bản test ở đầu câu nếu có
               .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ") // Biến ký tự đặc biệt thành khoảng trắng
               .replace(/\s+/g, " ");
};

export const processSemanticAI = async (userId, rawMessage) => {
    const message = cleanText(rawMessage);
    
    let intent = 'DEFAULT';
    let entities = {
        modelName: null,
        variantName: null,
        feature: null,
        color: null,
        vin: null,
        minBudget: null,
        maxBudget: null,
        seats: null
    };

    // 1. PHÂN TÍCH Ý ĐỊNH
    const intentScores = {
        'PRICE_QUERY': 0, 'INSTALLMENT_QUERY': 0, 'STOCK_QUERY': 0,
        'COLOR_QUERY': 0, 'SPECS_QUERY': 0, 'TECHNICAL_SUPPORT': 0, 'NEWS_QUERY': 0
    };

    const keywordWeights = {
        'PRICE_QUERY': ['giá', 'gia', 'bao nhiêu', 'bao nhieu', 'báo giá', 'bao gia', 'mức giá', 'nhiêu tiền', 'đắt', 'chi phí', 'tiền', 'bn', 'nhiu', 'giá lăn bánh', 'giá niêm yết'],
        'INSTALLMENT_QUERY': ['trả góp', 'tra gop', 'vay', 'ngân hàng', 'lãi suất', 'gói vay', 'tín dụng', 'trả trước', 'góp bao nhiêu'],
        'STOCK_QUERY': ['kho', 'bãi', 'sẵn không', 'san khong', 'sẵn có', 'còn xe', 'con xe', 'giao ngay', 'giao luon', 'có xe', 'co xe', 'đại lý', 'sẵn hàng', 'nhập kho', 'còn mấy con'],
        'COLOR_QUERY': ['màu gì', 'mau gi', 'mấy màu', 'bảng màu', 'list màu', 'phối màu', 'màu thực tế', 'màu đỏ', 'màu trắng', 'màu đen'],
        'SPECS_QUERY': ['thông số', 'tính năng', 'động cơ', 'hộp số', 'mã lực', 'specs', 'thiết kế', 'option', 'máy xăng', 'máy dầu', 'chạy bằng', 'chạy xăng', 'chạy dầu', 'cầu trước', 'hệ dẫn động', 'trang bị', 'tích hợp', 'adas', 'an toàn', 'fwd', 'awd', 'cửa sổ trời', 'camera 360', 'sạc không dây', 'cốp điện', 'ghế da'],
        'TECHNICAL_SUPPORT': ['lỗi', 'loi', 'hỏng', 'sự cố', 'không nổ', 'kêu', 'khói', 'chảy dầu', 'báo lỗi', 'vô lăng', 'nhiệt độ', 'chẩn đoán', 'bị sao', 'giật số', 'khựng máy', 'cá vàng', 'abs', 'dps6'],
        'NEWS_QUERY': ['tin tức', 'tin tuc', 'bài viết', 'khuyến mãi', 'sự kiện', 'khai xuân', 'ra mắt', 'showroom', 'ưu đãi']
    };

    for (const [intentName, keywords] of Object.entries(keywordWeights)) {
        keywords.forEach(kw => { if (message.includes(kw)) intentScores[intentName] += 1; });
    }

    let maxScore = 0;
    for (const [intentName, score] of Object.entries(intentScores)) {
        if (score > maxScore) { maxScore = score; intent = intentName; }
    }

    // 2. TRÍCH XUẤT DÒNG XE
    try {
        const allModels = await VehicleModel.find({}, 'name');
        for (const model of allModels.sort((a, b) => b.name.length - a.name.length)) {
            if (message.includes(model.name.toLowerCase())) {
                entities.modelName = model.name;
                break;
            }
        }
    } catch (err) { console.error(err); }

    // 3. TRÍCH XUẤT PHIÊN BẢN (KHỚP TỪ DB - ĐÃ BỎ BƯỚC HARDCODE GÂY LỖI)
    try {
        const allVariants = await Variant.find({});
        // Sắp xếp theo độ dài tên để khớp từ khóa chính xác nhất (Everest Platinum > Platinum)
        allVariants.sort((a, b) => b.variantName.length - a.variantName.length);
        
        for (const v of allVariants) {
            const searchTargets = [v.variantName, ...(v.aliases || [])];
            for (const target of searchTargets) {
                if (message.includes(target.toLowerCase())) {
                    entities.variantName = v.variantName;
                    break;
                }
            }
            if (entities.variantName) break;
        }
    } catch (err) { console.error(err); }

    // 4. MAP TÍNH NĂNG
    const featureMap = {
        'cửa sổ trời': 'sunroof', 'camera 360': 'camera360', 'ghế da': 'leatherSeat',
        'sạc không dây': 'wirelessCharging', 'phanh tự động': 'autoEmergencyBrake',
        'giữ làn': 'laneKeepAssist', 'thích ứng': 'adaptiveCruise', 'điểm mù': 'blindSpot',
        'cốp điện': 'powerTailgate', 'adas': 'adas', 'máy xăng': 'fuel_gasoline', 'máy dầu': 'fuel_diesel'
    };
    for (const [k, v] of Object.entries(featureMap)) {
        if (message.includes(k)) { entities.feature = v; break; }
    }

    // =========================================================
    // 5. TRÍCH XUẤT MÀU SẮC, SỐ KHUNG & PHÂN KHÚC GIÁ SỐ HỌC
    // =========================================================
    const colorsList = ['đen', 'den', 'đỏ', 'do', 'trắng', 'trang', 'bạc', 'bac', 'xám', 'xam', 'xanh'];
    for (const c of colorsList) {
        if (new RegExp(`\\b${c}\\b|màu ${c}`, 'i').test(message)) {
            if (c === 'den') entities.color = 'đen';
            else if (c === 'do') entities.color = 'đỏ';
            else if (c === 'trang') entities.color = 'trắng';
            else if (c === 'bac') entities.color = 'bạc';
            else if (c === 'xam') entities.color = 'xám';
            else entities.color = c;
            break;
        }
    }

    const vinMatch = message.match(/[a-z0-9]{10,17}/i);
    if (vinMatch) {
        const potentialVin = vinMatch[0].toUpperCase();
        if (!commonVariants.map(v=>v.toUpperCase()).includes(potentialVin)) {
            entities.vin = potentialVin;
        }
    }

    const allNumbers = message.match(/\d+/g);
    if (allNumbers && allNumbers.length >= 2 && /(đến|den|tới|toi|-)/i.test(message)) {
        let val1 = parseInt(allNumbers[0]); let val2 = parseInt(allNumbers[1]);
        let unitMultiplier = message.includes("tỷ") || message.includes("ty") ? 1000000000 : 1000000;
        entities.minBudget = val1 * unitMultiplier; entities.maxBudget = val2 * unitMultiplier;
    } else if (allNumbers && allNumbers.length === 1) {
        let val = parseInt(allNumbers[0]);
        let unitMultiplier = message.includes("tỷ") || message.includes("ty") ? 1000000000 : 1000000;
        let totalBudget = val * unitMultiplier;
        if (message.includes("dưới") || message.includes("duoi")) { entities.maxBudget = totalBudget; }
        else if (message.includes("trên") || message.includes("tren")) { entities.minBudget = totalBudget; }
        else { entities.minBudget = totalBudget - 100000000; entities.maxBudget = totalBudget + 100000000; }
    }

    if (message.includes("5 chỗ") || message.includes("5 người")) entities.seats = 5;
    if (message.includes("7 chỗ") || message.includes("7 người")) entities.seats = 7;

    return { intent, entities };
};