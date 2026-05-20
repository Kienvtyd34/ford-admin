import faiss from "faiss-node";
import { EMBED_DIM } from "./embedding.js";

export const brainIndex = new faiss.IndexFlatIP(EMBED_DIM);
export const brainMap = [];

// ===============================
// SAFE NORMALIZE VECTOR
// ===============================
const normalizeVector = (vec) => {
  if (!Array.isArray(vec)) return null;
  if (vec.length !== EMBED_DIM) return null;

  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
};

// ===============================
// LOAD BRAIN INTO FAISS INDEX
// ===============================
export const loadBrainToIndex = (brain = []) => {
  if (!Array.isArray(brain)) {
    throw new Error("Brain must be an array");
  }

  const vectors = [];
  const validItems = [];

  for (const item of brain) {
    if (!item?.vector) continue;

    const normalized = normalizeVector(item.vector);
    if (!normalized) continue;

    vectors.push(normalized);
    validItems.push(item);
  }

  if (vectors.length === 0) {
    console.log("⚠️ Brain empty - skip indexing");
    return;
  }

  // ===============================
  // FLATTEN MATRIX (IMPORTANT FIX)
  // ===============================
  const flat = new Float32Array(vectors.length * EMBED_DIM);

  vectors.forEach((vec, i) => {
    flat.set(vec, i * EMBED_DIM);
  });

  brainIndex.add(flat);

  brainMap.push(...validItems);

  console.log(`🧠 Brain indexed: ${validItems.length}`);
};