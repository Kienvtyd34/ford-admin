import faiss from "faiss-node";
import { EMBED_DIM } from "./embedding.js";

export const brainIndex = new faiss.IndexFlatIP(EMBED_DIM);

export const brainMap = [];

// ===============================
// ADD VECTOR TO INDEX
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
    const norm =
      Math.sqrt(
        vector.reduce(
          (s, v) => s + v * v,
          0
        )
      ) || 1;

    const normalized = vector.map(
      (v) => v / norm
    );

    // IMPORTANT:
    // FAISS NEEDS FLAT MATRIX
    const flat =
      new Float32Array(EMBED_DIM);

    flat.set(normalized);

    brainIndex.add(flat);

    brainMap.push(payload);

  } catch (err) {

    console.log(
      "❌ addBrainItem error:",
      err.message
    );

  }
};