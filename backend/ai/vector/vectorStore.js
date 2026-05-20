import faiss from "faiss-node";
import { EMBED_DIM } from "./embedding.js";

export const brainIndex =
  new faiss.IndexFlatIP(EMBED_DIM);

export const brainMap = [];

// ===============================
// NORMALIZE VECTOR
// ===============================

const normalizeVector = (
  vector
) => {

  const norm =
    Math.sqrt(
      vector.reduce(
        (s, v) => s + v * v,
        0
      )
    ) || 1;

  return vector.map(
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
      normalizeVector(vector);

    // IMPORTANT FIX
    const flat =
      Float32Array.from(
        normalized
      );

    // FAISS ADD
    brainIndex.add(flat, 1);

    // SAVE MAP
    brainMap.push(payload);

  } catch (err) {

    console.log(
      "❌ addBrainItem error:",
      err.message
    );

  }
};