import { embedText } from "../vector/embedding.js";

import {
  brainIndex,
  brainMap,
} from "../vector/vectorStore.js";

export const searchBrain = async (
  query,
  k = 10
) => {

  if (brainMap.length === 0) {
    return [];
  }

  const vec =
    await embedText(query);

  // IMPORTANT:
  // faiss-node search()
  // NEEDS ARRAY
  const result =
    brainIndex.search(
      [vec],
      Math.min(k, brainMap.length)
    );

  const labels =
    result.labels[0];

  const distances =
    result.distances[0];

  return labels
    .map((id, idx) => {

      if (
        id === -1 ||
        !brainMap[id]
      ) {
        return null;
      }

      return {
        ...brainMap[id],
        score: distances[idx],
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.score - a.score
    );
};