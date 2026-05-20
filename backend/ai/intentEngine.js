import { embedText } from "./embedding.js";

const INTENTS = {
  recommend: [
    "xe nào phù hợp cho gia đình",
    "tư vấn xe ford",
    "nên mua xe gì",
    "chọn suv 7 chỗ",
    "xe đi đường dài tốt"
  ],

  price: [
    "giá xe bao nhiêu",
    "bảng giá ford",
    "xe này giá bao nhiêu",
    "cost bao nhiêu"
  ],

  news: [
    "tin tức ford",
    "khuyến mãi",
    "xe mới ra mắt",
    "ưu đãi ford"
  ],

  problem: [
    "xe bị lỗi",
    "xe hỏng",
    "sửa xe",
    "lỗi thường gặp"
  ],
};

const intentVec = {};

const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }

  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

export const initIntents = async () => {
  for (const key in INTENTS) {
    intentVec[key] = await Promise.all(
      INTENTS[key].map((t) => embedText(t))
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