import { normalize } from "../utils/normalize.js";

export const intentEngine = (message = "") => {
  const text = normalize(message);

  const rules = [
    { intent: "PRICE", keys: ["gia", "giá", "bao nhieu", "bao nhiêu"] },
    { intent: "COMPARE", keys: ["so sanh", "khac nhau"] },
    { intent: "FEATURE", keys: ["tinh nang", "co khong", "option"] },
    { intent: "SUGGEST", keys: ["nen mua", "phu hop", "xe 7 cho", "gia dinh"] },
    { intent: "INVENTORY", keys: ["con xe", "giao ngay", "ton kho"] },
    { intent: "TECH", keys: ["loi", "hong", "khong mát", "rung", "u3000"] },
  ];

  let best = { intent: "UNKNOWN", score: 0 };

  for (const r of rules) {
    let score = 0;
    for (const k of r.keys) if (text.includes(k)) score++;
    if (score > best.score) best = { intent: r.intent, score };
  }

  return {
    intent: best.intent,
    confidence: Math.min(best.score / 3, 1),
  };
};

export default intentEngine;