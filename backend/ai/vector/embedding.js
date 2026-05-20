import { pipeline } from "@xenova/transformers";

let extractor = null;

export const EMBED_DIM = 384;

export const loadEmbeddingModel = async () => {
  if (!extractor) {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );

    console.log("🧠 Embedding model loaded");
  }

  return extractor;
};

export const embedText = async (text = "") => {
  const model = await loadEmbeddingModel();

  const output = await model(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
};