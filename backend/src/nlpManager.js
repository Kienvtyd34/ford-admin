import stringSimilarity from "string-similarity";
import VehicleModel from "./models/VehicleModel.js";
import Variant from "./models/Variant.js";

const commonVariants = []; // Đã khai báo để tránh lỗi[cite: 2]

export const cleanText = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/^\d+[\.\s\-]+/g, "")
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ");
};

export const processSemanticAI = async (userId, rawMessage) => {
  const message = cleanText(rawMessage);
  let intent = "DEFAULT";
  const entities = {
    modelName: null, variantName: null, feature: null, 
    color: null, vin: null, minBudget: null, maxBudget: null, seats: null
  };

  // Intent Detection logic[cite: 2]
  const intentScores = { PRICE_QUERY: 0, INSTALLMENT_QUERY: 0, STOCK_QUERY: 0, COLOR_QUERY: 0, SPECS_QUERY: 0, TECHNICAL_SUPPORT: 0, NEWS_QUERY: 0, CONSULTING_QUERY: 0 };
  const keywordWeights = {
    PRICE_QUERY: ["giá", "bao nhiêu", "báo giá", "nhiêu tiền", "bn", "nhiu", "giá lăn bánh"],
    INSTALLMENT_QUERY: ["trả góp", "vay", "ngân hàng", "lãi suất", "trả trước"],
    STOCK_QUERY: ["còn xe", "có xe", "sẵn xe", "sẵn hàng", "giao ngay", "kho", "bãi"],
    COLOR_QUERY: ["màu gì", "mấy màu", "bảng màu", "màu đỏ", "màu trắng", "màu đen"],
    SPECS_QUERY: ["thông số", "động cơ", "hộp số", "mã lực", "option", "an toàn", "máy xăng", "máy dầu"],
    TECHNICAL_SUPPORT: ["lỗi", "hỏng", "sự cố", "không nổ", "khói", "chảy dầu"],
    NEWS_QUERY: ["tin tức", "khuyến mãi", "sự kiện", "ưu đãi", "ra mắt"],
    CONSULTING_QUERY: ["xe nào", "tư vấn", "mua xe", "gia đình", "5 chỗ", "7 chỗ"]
  };

  for (const [intentName, keywords] of Object.entries(keywordWeights)) {
    keywords.forEach((kw) => { if (message.includes(kw)) intentScores[intentName]++; });
  }

  let maxScore = 0;
  for (const [intentName, score] of Object.entries(intentScores)) {
    if (score > maxScore) { maxScore = score; intent = intentName; }
  }

  // Model Detection[cite: 2]
  try {
    const allModels = await VehicleModel.find({}).lean();
    for (const model of allModels.sort((a, b) => b.name.length - a.name.length)) {
      const targets = [model.name, ...(model.aliases || [])];
      for (const target of targets) {
        if (message.includes(cleanText(target))) { entities.modelName = model.name; break; }
      }
      if (entities.modelName) break;
    }
  } catch (err) { console.error(err); }

  // Variant Detection[cite: 2]
  try {
    const allVariants = await Variant.find({}).lean();
    let bestScore = 0;
    for (const variant of allVariants) {
      const targets = [variant.variantName, ...(variant.aliases || [])];
      for (const target of targets) {
        const normalized = cleanText(target);
        if (message.includes(normalized)) { entities.variantName = variant.variantName; bestScore = 1; break; }
        const score = stringSimilarity.compareTwoStrings(message, normalized);
        if (score > bestScore && score > 0.55) { bestScore = score; entities.variantName = variant.variantName; }
      }
    }
  } catch (err) { console.error(err); }

  // =========================
  // FEATURE DETECTION
  // =========================

  const featureMap = {
    "camera 360": "camera360",
    "cửa sổ trời": "sunroof",
    "ghế da": "leatherSeat",
    "sạc không dây": "wirelessCharging",
    "cốp điện": "powerTailgate",

    "adas": "adas",

    "phanh tự động": "autoEmergencyBrake",

    "giữ làn": "laneKeepAssist",

    "điểm mù": "blindSpot",

    "adaptive cruise": "adaptiveCruise",
    "thích ứng": "adaptiveCruise",

    "fordpass": "fordPass",

    "biển báo giao thông":
      "trafficSignRecognition",

    "ghế sưởi": "heatedSeat",

    "ghế làm mát": "ventilatedSeat",

    "máy xăng": "fuel_gasoline",
    "máy dầu": "fuel_diesel",

    "xe điện": "fuel_electric",
    "động cơ điện": "fuel_electric"
  };

  for (const [k, v] of Object.entries(featureMap)) {
    if (message.includes(k)) {
      entities.feature = v;
      break;
    }
  }

  if (message.includes("fwd"))
    entities.feature = "drive_fwd";

  if (message.includes("awd"))
    entities.feature = "drive_awd";

  if (message.includes("4wd"))
    entities.feature = "drive_4wd";

  if (message.includes("4x4"))
    entities.feature = "drive_4wd";

  // =========================
  // COLOR
  // =========================

  const colors = [
    "đen",
    "đỏ",
    "trắng",
    "bạc",
    "xám",
    "xanh"
  ];

  for (const color of colors) {
    if (message.includes(color)) {
      entities.color = color;
      break;
    }
  }

  // =========================
  // VIN
  // =========================

  const vinMatch = message.match(
    /\b[A-HJ-NPR-Z0-9]{17}\b/i
  );

  if (vinMatch) {
    entities.vin = vinMatch[0].toUpperCase();
  }

  // =========================
  // BUDGET
  // =========================

  const numbers = message.match(/\d+/g);

  if (numbers) {
    if (
      numbers.length >= 2 &&
      /(đến|toi|tới|-)/i.test(message)
    ) {
      const val1 = parseInt(numbers[0]);
      const val2 = parseInt(numbers[1]);

      const multiplier =
        message.includes("tỷ") ||
        message.includes("ty")
          ? 1000000000
          : 1000000;

      entities.minBudget = val1 * multiplier;
      entities.maxBudget = val2 * multiplier;
    } else if (numbers.length === 1) {
      const value = parseInt(numbers[0]);

      const multiplier =
        message.includes("tỷ") ||
        message.includes("ty")
          ? 1000000000
          : 1000000;

      const budget = value * multiplier;

      if (
        message.includes("dưới") ||
        message.includes("duoi")
      ) {
        entities.maxBudget = budget;
      } else if (
        message.includes("trên") ||
        message.includes("tren")
      ) {
        entities.minBudget = budget;
      }
    }
  }

  // =========================
  // SEATS
  // =========================

  if (
    message.includes("5 chỗ") ||
    message.includes("5 người")
  ) {
    entities.seats = 5;
  }

  if (
    message.includes("7 chỗ") ||
    message.includes("7 người")
  ) {
    entities.seats = 7;
  }

  return {
    intent,
    entities
  };
};