import { index, idMap, textToVector } from "./vectorStore.js";

export const search = (query, k = 5) => {
  try {
    if (!query) return [];

    const queryVec = Float32Array.from(textToVector(query));

    const result = index.search(queryVec, k);

    return result.labels
      .map((i, idx) => {
        if (i === -1) return null;

        return {
          ...idMap[i],
          score: result.distances?.[idx] ?? 999
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.score - b.score);

  } catch (err) {
    console.error("VECTOR ERROR:", err);
    return [];
  }
};