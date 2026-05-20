import { embedText } from "../vector/embedding.js";

import {
  brainIndex,
  brainMap,
} from "../vector/vectorStore.js";

export const searchBrain = async (
  query,
  k = 20
) => {

  try {

    if (!brainMap.length) {
      return [];
    }

    const vector =
      await embedText(query);

    const result =
      brainIndex.search(
        vector,
        Math.min(k, brainMap.length)
      );

    const mapped =
      result.labels
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
        .filter(Boolean);

    // DEBUG
    console.log(
      "🔍 SEARCH:",
      query
    );

    console.log(
      "🔍 RESULTS:",
      mapped.map(
        (r) =>
          `${r.type} - ${
            r.payload?.name ||
            r.payload?.title ||
            r.payload?.variantName
          }`
      )
    );

    return mapped;

  } catch (err) {

    console.log(
      "❌ searchBrain:",
      err.message
    );

    return [];
  }
};