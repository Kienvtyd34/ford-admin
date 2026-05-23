import { normalize } from "../../../src/utils/normalize.js";

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
  ],

  VEHICLE_SUGGESTION: [
    "goi y",
    "xe gia dinh",
    "xe nao",
    "tu van",
  ],

  TEST_DRIVE: [
    "lai thu",
    "test drive",
  ],

  BOOKING: [
    "dat coc",
    "booking",
    "thanh toan",
    "vietqr",
  ],

  TECH_SUPPORT: [
    "khong mat",
    "rung",
    "bao loi",
    "abs",
  ],
};

export const detectIntent = (message = "") => {
  const text = normalize(message);

  let bestIntent = "UNKNOWN";
  let bestScore = 0;

  for (const intent in patterns) {
    let score = 0;

    for (const keyword of patterns[intent]) {
      if (text.includes(keyword)) {
        score++;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return {
    intent: bestIntent,
    confidence: Math.min(bestScore / 3, 1),
  };
};

export default detectIntent;