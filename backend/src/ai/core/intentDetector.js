import { normalize } from "../../../src/utils/normalize.js";

const INTENT_RULES = [
  {
    intent: "PRICE_QUERY",
    keywords: [
      "gia", "bao nhieu", "price", "cost",
      "gia xe", "gia everest", "gia ranger",
      "everest", "ranger", "territory"
    ],
    weight: 3,
  },
  {
    intent: "COMPARE",
    keywords: ["so sanh", "khac nhau", "vs", "hay hon"],
    weight: 3,
  },
  {
    intent: "FEATURE_QUERY",
    keywords: ["co khong", "adas", "camera", "sunroof", "tinh nang"],
    weight: 3,
  },
  {
    intent: "TECH_SUPPORT",
    keywords: ["khong mát", "loi", "rung", "den bao", "u3000", "abs"],
    weight: 4,
  },
  {
    intent: "INVENTORY_CHECK",
    keywords: ["ton kho", "con xe", "giao ngay", "co xe khong"],
    weight: 3,
  },
  {
    intent: "VEHICLE_SUGGESTION",
    keywords: ["phu hop", "gia dinh", "du lich", "nen mua", "xe nao"],
    weight: 3,
  },
  {
    intent: "GREETING",
    keywords: ["xin chao", "hello", "hi", "chao"],
    weight: 5,
  },
];

export const detectIntent = (message = "") => {
  const text = normalize(message);

  const scores = {};

  for (const rule of INTENT_RULES) {
    scores[rule.intent] = 0;

    for (const kw of rule.keywords) {
      if (text.includes(normalize(kw))) {
        scores[rule.intent] += rule.weight;
      }
    }
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  if (!best || best[1] === 0) {
    return {
      intent: "UNKNOWN",
      confidence: 0,
    };
  }

  return {
    intent: best[0],
    confidence: Math.min(best[1] / 6, 1),
  };
};

export default detectIntent;