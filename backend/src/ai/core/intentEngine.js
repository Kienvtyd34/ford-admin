export const intentEngine = (message = "") => {
  const text = message.toLowerCase();

  const rules = [
    { intent: "PRICE", keys: ["gia", "bao nhieu", "price"] },
    { intent: "COMPARE", keys: ["so sanh", "khac nhau", "vs"] },
    { intent: "FEATURE", keys: ["tinh nang", "co khong", "adas", "camera"] },
    { intent: "SUGGEST", keys: ["phu hop", "nen mua", "gia dinh", "du lich"] },
    { intent: "INVENTORY", keys: ["ton kho", "con xe", "giao ngay"] },
    { intent: "TECH", keys: ["loi", "hong", "khong mát", "rung"] },
  ];

  let best = { intent: "UNKNOWN", score: 0 };

  for (const r of rules) {
    let score = 0;
    for (const k of r.keys) {
      if (text.includes(k)) score++;
    }
    if (score > best.score) best = { intent: r.intent, score };
  }

  return {
    intent: best.score > 0 ? best.intent : "FALLBACK",
    confidence: Math.min(best.score / 3, 1),
  };
};

export default intentEngine;