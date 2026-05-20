import { embedText } from "./embedding.js";

const INTENTS = {
  recommend: [
    "xe gia đình",
    "xe 7 chỗ",
    "tư vấn xe ford",
    "mua xe gì",
    "xe suv",
    "xe đi gia đình",
  ],

  price: [
    "giá xe",
    "bảng giá",
    "xe bao nhiêu tiền",
    "cost",
  ],

  news: [
    "tin tức",
    "khuyến mãi",
    "xe mới",
  ],

  problem: [
    "xe lỗi",
    "hỏng xe",
    "sửa xe",
  ],
};

const intentVec = {};

const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] ** 2;
    nb += b[i] ** 2;
  }

  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

export const initIntents = async () => {
  for (const key in INTENTS) {
    intentVec[key] = await Promise.all(
      INTENTS[key].map(embedText)
    );
  }
};

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