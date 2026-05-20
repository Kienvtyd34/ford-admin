import faiss from "faiss-node";
import { EMBED_DIM } from "./embedding.js";

export const brainIndex =
  new faiss.IndexFlatIP(EMBED_DIM);

export const brainMap = [];

// ===============================
// NORMALIZE
// ===============================

const normalize = (vec) => {

  const norm =
    Math.sqrt(
      vec.reduce(
        (s, v) => s + v * v,
        0
      )
    ) || 1;

  return vec.map(
    (v) => v / norm
  );
};

// ===============================
// ADD VECTOR
// ===============================

export const addBrainItem = (
  vector,
  payload
) => {

  try {

    // VALIDATE
    if (
      !Array.isArray(vector)
    ) {
      console.log(
        "❌ vector not array"
      );
      return;
    }

    if (
      vector.length !== EMBED_DIM
    ) {
      console.log(
        "❌ invalid dim:",
        vector.length
      );
      return;
    }

    // NORMALIZE
    const normalized =
      normalize(vector);

    // IMPORTANT FIX
    // MUST BE NORMAL JS ARRAY
    brainIndex.add(normalized);

    // SAVE
    brainMap.push(payload);

  } catch (err) {

    console.log(
      "❌ addBrainItem error:",
      err.message
    );

  }
};