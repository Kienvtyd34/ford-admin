import faiss from "faiss-node";
import { EMBED_DIM } from "./embedding.js";

export const brainIndex = new faiss.IndexFlatIP(EMBED_DIM);
export const brainMap = [];

export const addBrainItem = (vector, payload) => {
  if (!vector || vector.length !== EMBED_DIM) return;

  brainIndex.add(Float32Array.from(vector));

  brainMap.push(payload);
};