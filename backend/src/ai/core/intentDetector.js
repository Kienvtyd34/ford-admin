import { normalize } from "../../../src/utils/normalize.js";

const patterns = {
  PRICE_QUERY: [
    "gia",
    "bao nhieu",
    "bao gia",
    "lan banh",
    "bao tien",
  ],

  VEHICLE_SUGGESTION: [
    "goi y",
    "gia dinh",
    "di pho",
    "du lich",
    "cong trinh",
    "rong rai",
    "tiet kiem",
    "ban tai",
    "tu van",
  ],

  COMPARE: [
    "so sanh",
    "khac gi",
    "hon gi",
    "manh hon",
    "nen chon",
  ],

  INVENTORY_CHECK: [
    "con hang",
    "ton kho",
    "giao ngay",
    "co san",
    "mau",
    "showroom",
  ],

  VEHICLE_SPEC: [
    "dong co",
    "camera",
    "adas",
    "4x4",
    "turbo",
    "tieu hao",
    "binh xang",
    "tai duoc",
    "may cho",
    "cua so troi",
  ],

  TECH_SUPPORT: [
    "khong mat",
    "rung",
    "abs",
    "dong co",
    "kho no",
    "hao xang",
    "vo lang",
    "chet binh",
    "mui hoi",
    "gam xe",
  ],

  GREETING: [
    "xin chao",
    "ban la ai",
    "cam on",
    "tam biet",
    "hotline",
    "khuyen mai",
    "tu van mua xe",
  ],
};

export const detectIntent = (
  message = ""
) => {
  const text = normalize(message);

  let bestIntent = "UNKNOWN";
  let bestScore = 0;

  for (const intent in patterns) {
    let score = 0;

    for (const keyword of patterns[
      intent
    ]) {
      if (text.includes(keyword)) {
        score += keyword.length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return {
    intent: bestIntent,
    confidence: Math.min(
      bestScore / 15,
      1
    ),
  };
};

export default detectIntent;
