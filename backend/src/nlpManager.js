import stringSimilarity from 'string-similarity';
import VehicleModel from './models/VehicleModel.js';

export const cleanText = (text) => {
    if (!text) return "";
    return text.toLowerCase()
               .trim()
               .replace(/^\d+[\.\s\-]+/g, "") // Gọt sạch số thứ tự kịch bản test (16., 36.,...)
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
        minBudget: null, // Phục vụ khoảng giá số học động từ X đến Y
        maxBudget: null, 
        seats: null,
        carType: null
    };

    // =========================================================
    // 1. CHẨN ĐOÁN INTENT BẰNG TRỌNG SỐ ĐIỂM MATRAN (SCORE MATRIX)
    // =========================================================
    const intentScores = {
        'PRICE_QUERY': 0,
        'INSTALLMENT_QUERY': 0,
        'STOCK_QUERY': 0,
        'COLOR_QUERY': 0,
        'SPECS_QUERY': 0,
        'TECHNICAL_SUPPORT': 0,
        'NEWS_QUERY': 0
    };

    const keywordWeights = {
        'PRICE_QUERY': ['giá', 'gia', 'bao nhiêu', 'bao nhieu', 'báo giá', 'bao gia', 'mức giá', 'nhiêu tiền', 'nhieu tien', 'đắt', 'dat', 'tốn', 'ton', 'chi phí', 'tiền', 'tien', 'bn', 'nhiu'],
        'INSTALLMENT_QUERY': ['trả góp', 'tra gop', 'vay', 'ngân hàng', 'lãi suất', 'gói vay', 'tín dụng', 'thủ tục mua', 'trả trước'],
        'STOCK_QUERY': ['kho', 'bãi', 'sẵn không', 'san khong', 'sẵn có', 'còn xe', 'con xe', 'giao ngay', 'giao luon', 'có xe', 'co xe', 'đại lý', 'sẵn hàng', 'hàng không', 'nhập kho', 'để qua xem'],
        'COLOR_QUERY': ['màu gì', 'mau gi', 'mấy màu', 'may mau', 'ảnh xe', 'anh xe', 'hình ảnh', 'hinh anh', 'mã hex', 'ma hex', 'bảng màu', 'list màu', 'phối màu'],
        'SPECS_QUERY': ['thông số', 'thong so', 'tính năng', 'tinh nang', 'động cơ', 'hộp số', 'mã lực', 'specs', 'thiết kế', 'option', 'máy xăng', 'máy dầu', 'chạy bằng', 'chạy xăng', 'chạy dầu', 'chạy điện', 'cầu trước', 'hệ dẫn động', 'trang bị', 'tích hợp', 'kết nối', 'adas', 'an toàn'],
        'TECHNICAL_SUPPORT': ['lỗi', 'loi', 'hỏng', 'hong', 'sự cố', 'su co', 'không nổ', 'kêu', 'khói', 'chảy dầu', 'báo lỗi', 'vô lăng', 'nhiệt độ', 'chẩn đoán', 'bị sao', 'bi benh gi', 'giật số', 'khựng máy', 'cá vàng', 'trơn trượt', 'vòng tua', 'u3000', 'abs', 'dps6', 'giật'],
        'NEWS_QUERY': ['tin tức', 'tin tuc', 'bài viết', 'khuyến mãi', 'sự kiện', 'khai xuân', 'thiệp mời', 'ra mắt', 'showroom']
    };

    // Cộng dồn điểm dựa trên mật độ từ khóa xuất hiện
    for (const [intentName, keywords] of Object.entries(keywordWeights)) {
        keywords.forEach(kw => {
            if (message.includes(kw)) {
                intentScores[intentName] += 1;
            }
        });
    }

    // Lọc Intent có điểm cao nhất
    let maxScore = 0;
    for (const [intentName, score] of Object.entries(intentScores)) {
        if (score > maxScore) {
            maxScore = score;
            intent = intentName;
        }
    }

    // Bẫy phủ định & tư vấn nhu cầu khi điểm số bằng 0 hoặc mặc định
    if (intent === 'DEFAULT' || maxScore === 0) {
        if (message.includes("có") && (message.includes("không") || message.includes("ko"))) {
            intent = 'SPECS_QUERY';
        } else if (/(tài chính|kinh phí|tầm|khoảng|dưới|triệu|tỷ|ty|người|chỗ|gia đình|đi phố|off-road|địa hình|bán tải|phượt|chở hàng|tr)/i.test(message)) {
            intent = 'ADVISORY_QUERY';
        }
    }

    // =========================================================
    // 2. KHỚP DÒNG XE TỰ ĐỘNG TỪ DB (DATABASE-DRIVEN FUZZY)
    // =========================================================
    try {
        const allModels = await VehicleModel.find({}, 'name');
        let bestMatchModel = null;
        let highestModelScore = 0;

        for (const model of allModels) {
            const modelNameLower = model.name.toLowerCase();
            if (message.includes(modelNameLower)) {
                bestMatchModel = model.name;
                highestModelScore = 1.0;
                break; 
            }
            const words = modelNameLower.split(' ');
            if (words.some(word => word.length > 2 && message.includes(word))) {
                bestMatchModel = model.name;
                highestModelScore = 0.9;
                break;
            }
            const score = stringSimilarity.compareTwoStrings(message, modelNameLower);
            if (score > highestModelScore && score > 0.15) {
                highestModelScore = score;
                bestMatchModel = model.name;
            }
        }
        if (bestMatchModel) entities.modelName = bestMatchModel;
    } catch (err) {
        console.error("❌ Lỗi trích xuất dòng xe:", err);
    }

    // =========================================================
    // 3. BÓC TÁCH PHIÊN BẢN (VARIANT)
    // =========================================================
    const commonVariants = ['titanium x', 'titanium', 'wildtrak', 'sport', 'premium', 'xls', 'xlt', 'ambient', 'raptor', 'platinum', 'trend'];
    for (const v of commonVariants) {
        if (message.includes(v)) {
            entities.variantName = v.toUpperCase(); 
            break;
        }
    }

    // =========================================================
    // 4. MA TRẬN ÁNH XẠ TÍNH NĂNG CON (MAPPING TO BOOLEAN SCHEMAS)
    // =========================================================
    const featureMap = {
        'cửa sổ trời': 'sunroof', 'sunroof': 'sunroof', 'cua so troi': 'sunroof',
        'camera 360': 'camera360', 'cam 360': 'camera360', 'camera360': 'camera360',
        'màn hình': 'screen', 'man hinh': 'screen',
        'ghế da': 'leatherSeats', 'ghe da': 'leatherSeats',
        'sạc không dây': 'wirelessCharging', 'wirelesscharging': 'wirelessCharging', 'wireless charging': 'wirelessCharging',
        'phanh tự động': 'autoEmergencyBrake', 'autoemergencybrake': 'autoEmergencyBrake', 'phanh tu dong': 'autoEmergencyBrake',
        'giữ làn': 'laneKeepAssist', 'lanekeepassist': 'laneKeepAssist', 'giu lan': 'laneKeepAssist',
        'thích ứng': 'adaptiveCruise', 'adaptivecruise': 'adaptiveCruise', 'thich ung': 'adaptiveCruise',
        'điểm mù': 'blindSpot', 'blindspot': 'blindSpot', 'diem mu': 'blindSpot',
        'cốp điện': 'powerTailgate', 'powertailgate': 'powerTailgate', 'cop dien': 'powerTailgate',
        'fordpass': 'fordPass', 'ford pass': 'fordPass',
        'sưởi ghế': 'heatedSeats', 'suoi ghe': 'heatedSeats', 'làm mát ghế': 'cooledSeats', 'lam mat ghe': 'cooledSeats',
        'nhận diện biển báo': 'trafficSignRecognition', 'trafficsignrecognition': 'trafficSignRecognition', 'nhan dien bien bao': 'trafficSignRecognition',
        'adas': 'adas'
    };
    for (const [k, v] of Object.entries(featureMap)) {
        if (message.includes(k)) {
            entities.feature = v;
            break;
        }
    }

    // =========================================================
    // 5. BÓC TÁCH MÀU SẮC & SỐ KHUNG VIN
    // =========================================================
    const colorsList = ['đen', 'den', 'đỏ', 'do', 'trắng', 'trang', 'bạc', 'bac', 'xám', 'xam', 'xanh'];
    for (const c of colorsList) {
        if (new RegExp(`\\b${c}\\b|màu ${c}|xe màu ${c}`, 'i').test(message)) {
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
        if (!commonVariants.map(v=>v.toUpperCase()).includes(potentialVin) && !['EVEREST','RANGER','TERRITORY','EXPLORER','TRANSIT','MUSTANG'].some(x => potentialVin.includes(x))) {
            entities.vin = potentialVin;
        }
    }

    // =========================================================
    // 6. XỬ LÝ KHOẢNG GIÁ SỐ HỌC ĐỘNG & NHU CẦU (NHÓM 5)
    // =========================================================
    const allNumbers = message.match(/\d+/g);
    if (allNumbers && allNumbers.length >= 2 && /(đến|den|tới|toi|-)/i.test(message)) {
        let val1 = parseInt(allNumbers[0]);
        let val2 = parseInt(allNumbers[1]);
        let unitMultiplier = message.includes("tỷ") || message.includes("ty") ? 1000000000 : 1000000;
        entities.minBudget = val1 * unitMultiplier;
        entities.maxBudget = val2 * unitMultiplier;
    } else if (allNumbers && allNumbers.length === 1) {
        let val = parseInt(allNumbers[0]);
        let unitMultiplier = message.includes("tỷ") || message.includes("ty") ? 1000000000 : 1000000;
        let totalBudget = val * unitMultiplier;
        
        if (message.includes("dưới") || message.includes("duoi")) {
            entities.maxBudget = totalBudget;
        } else if (message.includes("trên") || message.includes("tren")) {
            entities.minBudget = totalBudget;
        } else {
            entities.minBudget = totalBudget - 150000000;
            entities.maxBudget = totalBudget + 150000000;
        }
    } else if (message.includes("dưới 1 tỷ") || message.includes("duoi 1 ty")) {
        entities.maxBudget = 1000000000;
    }

    if (message.includes("5 chỗ") || message.includes("5 người") || message.includes("5 nguoi")) entities.seats = 5;
    if (message.includes("7 chỗ") || message.includes("7 người") || message.includes("nhà đông người")) entities.seats = 7;

    if (message.includes("điện") || message.includes("dien")) entities.carType = "EV";
    if (message.includes("bán tải") || message.includes("ban tai") || message.includes("pick-up") || message.includes("công trường")) entities.carType = "PICKUP";
    if (message.includes("cuv") || message.includes("gầm cao") || message.includes("đi phố")) entities.carType = "CUV";
    if (message.includes("off-road") || message.includes("địa hình") || message.includes("phượt")) entities.carType = "SUV_OFFROAD";

    return { intent, entities };
};