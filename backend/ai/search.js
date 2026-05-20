import { index, idMap } from "./vectorStore.js";
import { embedText } from "./embedding.js";

const keywordBoost = (q) => {
  let score = 0;
  const t = q.toLowerCase();

  if (t.includes("ford")) score += 0.05;
  if (t.includes("suv")) score += 0.05;
  if (t.includes("7 chỗ")) score += 0.07;

  return score;
};

export const search = async (query, k = 5) => {
  const vec = await embedText(query);

  const result = index.search(Float32Array.from(vec), k);

  return result.labels
    .map((i, idx) => {
      if (i === -1) return null;

      return {
        ...idMap[i],
        score: result.distances[idx] + keywordBoost(query),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
};