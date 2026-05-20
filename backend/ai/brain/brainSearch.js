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

  const queryVector =
    new Float32Array(vec);

  const result =
    brainIndex.search(
      queryVector,
      Math.min(k, brainMap.length)
    );

  return result.labels
    .map((id, idx) => {

      if (
        id === -1 ||
        !brainMap[id]
      ) {
        return null;
      }

      return {
        ...brainMap[id],
        score:
          result.distances[idx],
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.score - a.score
    );
};