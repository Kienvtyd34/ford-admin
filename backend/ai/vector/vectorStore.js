import faiss from "faiss-node";
import { EMBED_DIM } from "./embedding.js";

export const brainIndex =
  new faiss.IndexFlatIP(EMBED_DIM);

export const brainMap = [];

// ===============================
// NORMALIZE VECTOR
// ===============================

const normalize = (vec) => {

  const norm =
    Math.sqrt(
      vec.reduce(
        (s, v) => s + v * v,
        0
      )
    ) || 1;

  return vec.map((v) => v / norm);
};

// ===============================
// ADD TO INDEX
// ===============================

export const addBrainItem = (
  vector,
  payload
) => {
  try {

    // VALIDATE
    if (
      !Array.isArray(vector) ||
      vector.length !== EMBED_DIM
    ) {
      console.log(
        "❌ Invalid vector"
      );
      return;
    }

    // NORMALIZE
    const normalized =
      normalize(vector);

    // IMPORTANT:
    // faiss-node NEEDS:
    // Array<Array<number>>
    brainIndex.add([
      normalized
    ]);

    brainMap.push(payload);

  } catch (err) {

    console.log(
      "❌ addBrainItem error:",
      err.message
    );

  }
};