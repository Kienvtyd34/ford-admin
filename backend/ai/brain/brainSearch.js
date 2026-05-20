import { embedText } from "../vector/embedding.js";

import {
  brainIndex,
  brainMap,
} from "../vector/vectorStore.js";

export const searchBrain = async (
  query,
  k = 10
) => {

  try {

    if (
      brainMap.length === 0
    ) {
      return [];
    }

    const vec =
      await embedText(query);

    // IMPORTANT:
    // MUST BE JS ARRAY
    const result =
      brainIndex.search(
        vec,
        Math.min(
          k,
          brainMap.length
        )
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

  } catch (err) {

    console.log(
      "❌ searchBrain error:",
      err.message
    );

    return [];
  }
};