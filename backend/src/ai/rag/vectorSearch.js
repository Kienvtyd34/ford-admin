import VehicleEmbedding from "../models/VehicleEmbedding.js";
import { embedText } from "./embedder.js";

const cosine = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] ** 2;
    nb += b[i] ** 2;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

export const vectorSearch = async (query) => {
  const qv = await embedText(query);

  const docs = await VehicleEmbedding.find();

  return docs
    .map(d => ({
      text: d.text,
      score: cosine(qv, d.vector),
    }))
    .filter(d => d.score > 0.75)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};

export default vectorSearch;