export const intentEngine = (message = "") => {
  const text = message.toLowerCase();

  const rules = [
    { intent: "PRICE", keys: ["gia", "bao nhieu", "giá"] },
    { intent: "COMPARE", keys: ["so sanh", "khac nhau", "vs"] },
    { intent: "FEATURE", keys: ["co khong", "tinh nang", "camera", "adas"] },
    { intent: "SUGGEST", keys: ["nen mua", "phu hop", "du lich", "gia dinh"] },
    { intent: "INVENTORY", keys: ["con xe", "giao ngay", "ton kho"] },
    { intent: "TECH", keys: ["loi", "hong", "abs", "den", "trơn trượt"] },
  ];

  let best = { intent: "FALLBACK", score: 0 };

  for (const r of rules) {
    let score = 0;
    for (const k of r.keys) {
      if (text.includes(k)) score++;
    }
    if (score > best.score) best = { intent: r.intent, score };
  }

  return {
    intent: best.intent,
    confidence: best.score > 0 ? best.score / 3 : 0,
  };
};

export default intentEngine;