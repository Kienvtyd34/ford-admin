import { pipeline } from "@xenova/transformers";

let model = null;

export const EMBED_DIM = 384;

const load = async () => {
  if (!model) {
    model = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    );
  }
  return model;
};

export const embedText = async (text) => {
  const m = await load();

  const output = await m(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
};