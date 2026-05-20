import faiss from "faiss-node";
import { EMBED_DIM } from "./embedding.js";

export const brainIndex = new faiss.IndexFlatIP(EMBED_DIM);
export const brainMap = [];

export const loadBrainToIndex = (brain) => {
  brain.forEach((b) => {
    brainIndex.add(Float32Array.from(b.vector));
    brainMap.push(b);
  });
};