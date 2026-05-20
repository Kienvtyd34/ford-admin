import Memory from "../src/models/memory.js";
import { embedText } from "./embedding.js";

/**
 * tìm ký ức liên quan (semantic memory)
 */
export const searchMemory = async (userId, query) => {
  const memory = await Memory.findOne({ userId });

  if (!memory) return [];

  const queryVec = await embedText(query);

  const scored = await Promise.all(
    memory.messages.map(async (m) => {
      const vec = await embedText(m.text);

      const score = cosine(queryVec, vec);

      return { ...m.toObject?.() || m, score };
    })
  );

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

// cosine
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