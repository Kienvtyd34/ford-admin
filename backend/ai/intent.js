import { textToVector } from "./vectorStore.js";

const intents = [
  { name: "price", samples: ["giá bao nhiêu", "bao nhiêu tiền", "giá xe"] },
  { name: "recommend", samples: ["xe gia đình", "7 chỗ", "SUV", "gợi ý xe"] },
  { name: "problem", samples: ["xe lỗi", "không nổ máy", "phanh kêu"] },
  { name: "news", samples: ["tin tức", "khuyến mãi", "sự kiện"] }
];

const cosine = (a, b) => {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
};

export const detectIntent = (text) => {
  const input = textToVector(text);

  let best = { name: "unknown", score: 0 };

  for (let i of intents) {
    const vec = textToVector(i.samples.join(" "));
    const score = cosine(input, vec);

    if (score > best.score) {
      best = { name: i.name, score };
    }
  }

  return best.name;
};