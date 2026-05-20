import Memory from "../src/models/memory.js";
import { embedText } from "./embedding.js";

const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }

  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

export const searchMemory = async (userId, query) => {
  const memory = await Memory.findOne({ userId });

  if (!memory) return [];

  const queryVec = await embedText(query);

  return memory.messages
    .map((m) => {
      if (!m.vector) return null;

      return {
        ...m,
        score: cosine(queryVec, m.vector),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};