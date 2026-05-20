import { embedText } from "../vector/embedding.js";
import { brainIndex, brainMap } from "../vector/vectorStore.js";

export const searchBrain = async (query, k = 10) => {
  const vec = await embedText(query);

  const result = brainIndex.search(
    Float32Array.from(vec),
    k
  );

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