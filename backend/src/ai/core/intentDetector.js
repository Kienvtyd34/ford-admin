import { normalize } from "../../../src/utils/normalize.js";

const INTENT_RULES = [
  {
    intent: "PRICE_QUERY",
    keywords: ["gia", "bao nhieu", "cost", "price"],
    weight: 3,
  },
  {
    intent: "COMPARE",
    keywords: ["so sanh", "khac nhau", "vs", "hay hon"],
    weight: 3,
  },
  {
    intent: "FEATURE_QUERY",
    keywords: ["co khong", "adas", "camera", "sunroof"],
    weight: 2,
  },
  {
    intent: "VEHICLE_SPEC",
    keywords: ["thong so", "dong co", "cong suat", "hp"],
    weight: 3,
  },
  {
    intent: "TECH_SUPPORT",
    keywords: ["khong mát", "loi", "rung", "den bao"],
    weight: 3,
  },
  {
    intent: "INVENTORY_CHECK",
    keywords: ["ton kho", "con xe", "giao ngay"],
    weight: 3,
  },
  {
    intent: "VEHICLE_SUGGESTION",
    keywords: ["phu hop", "gia dinh", "du lich", "nen mua"],
    weight: 3,
  },
  {
    intent: "GREETING",
    keywords: ["xin chao", "hello", "hi"],
    weight: 5,
  },
];

export const detectIntent = (message = "") => {
  const text = normalize(message);

  const scores = {};

  for (const rule of INTENT_RULES) {
    scores[rule.intent] = 0;

    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
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

  const confidence = Math.min(best[1] / 5, 1);

  return {
    intent: best[0],
    confidence,
  };
};

export default detectIntent;