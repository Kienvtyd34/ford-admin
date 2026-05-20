import { embedText } from "./embedding.js";

const INTENTS = {
  recommend: ["xe nào tốt", "tư vấn xe", "mua xe gì"],
  price: ["giá bao nhiêu", "bảng giá", "cost"],
  news: ["tin mới", "khuyến mãi"],
  problem: ["xe lỗi", "hỏng xe"],
};

const intentVec = {};

const cosine = (a, b) => {
  let dot = 0,
    na = 0,
    nb = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }

  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

// INIT
export const initIntents = async () => {
  for (const key in INTENTS) {
    intentVec[key] = await Promise.all(
      INTENTS[key].map((t) => embedText(t))
    );
  }
};

// 👉 IMPORTANT: EXPORT detectIntent đúng cách
export const detectIntent = async (text) => {
  const qVec = await embedText(text);

  const scores = [];

  for (const key in intentVec) {
    let best = 0;

    for (const v of intentVec[key]) {
      best = Math.max(best, cosine(qVec, v));
    }

    scores.push({ intent: key, score: best });
  }

  return scores.sort((a, b) => b.score - a.score);
};