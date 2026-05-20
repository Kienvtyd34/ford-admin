import Memory from "../src/models/memory.js";
import { embedText } from "./embedding.js";

const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] ** 2;
    nb += b[i] ** 2;
  }

  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

export const searchMemory = async (userId, query) => {
  const memory = await Memory.findOne({ userId });
  if (!memory) return [];

  const qVec = await embedText(query);

  return memory.messages
    .map((m) => {
      const vec = m.vector || null;
      if (!vec) return null;

      return {
        ...m.toObject(),
        score: cosine(qVec, vec),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};