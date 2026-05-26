import { normalize } from "../../utils/normalize.js";

const patterns = {
  PRICE_QUERY: [
    "gia",
    "bao nhieu",
    "bao gia",
    "lan banh",
  ],

  INVENTORY_CHECK: [
    "con hang",
    "giao ngay",
    "ton kho",
    "mau",
  ],

  VEHICLE_SUGGESTION: [
    "goi y",
    "xe gia dinh",
    "xe nao",
    "tu van",
    "di pho",
    "du lich",
    "cong trinh",
    "tiet kiem",
  ],

  COMPARE: [
    "so sanh",
    "khac gi",
    "hon gi",
    "nen chon",
  ],

  VEHICLE_SPEC: [
    "dong co",
    "adas",
    "camera 360",
    "tieu hao",
    "may cho",
    "4x4",
    "cua so troi",
    "binh xang",
    "tai duoc",
    "turbo",
  ],

  TECH_SUPPORT: [
    "khong mat",
    "rung",
    "bao loi",
    "abs",
    "hao xang",
    "chet binh",
    "vo lang",
    "dong co",
  ],

  GREETING: [
    "xin chao",
    "hello",
    " hi ",
    "cam on",
    "tam biet",
    "hotline",
    "khuyen mai",
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
        score++;
      }
    }

    // Ưu tiên intent mạnh hơn
    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  // fallback đặc biệt cho giá xe

  if (
    text.includes("ranger") ||
    text.includes("everest") ||
    text.includes("territory")
  ) {
    if (
      text.includes("gia") ||
      text.includes("bao nhieu")
    ) {
      bestIntent = "PRICE_QUERY";
    }
  }

  return {
    intent: bestIntent,
    confidence: Math.min(
      bestScore / 3,
      1
    ),
  };
};

export default detectIntent;