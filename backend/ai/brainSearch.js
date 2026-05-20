import { brainIndex, brainMap } from "./brainStore.js";
import { embedText } from "./embedding.js";

export const searchBrain = async (query, k = 8) => {
  const vec = await embedText(query);

  const result = brainIndex.search(Float32Array.from(vec), k);

  return result.labels
    .map((i, idx) => {
      if (i === -1) return null;

      return {
        ...brainMap[i],
        score: result.distances[idx],
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);
};