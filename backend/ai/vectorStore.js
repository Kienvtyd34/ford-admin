import faiss from "faiss-node";
import { EMBED_DIM } from "./embedding.js";

export const index = new faiss.IndexFlatIP(EMBED_DIM);
export const idMap = [];

export const addToIndex = (vector, data) => {
  index.add(Float32Array.from(vector));
  idMap.push(data);
};