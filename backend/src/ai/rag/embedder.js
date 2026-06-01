import * as use from "@tensorflow-models/universal-sentence-encoder";

let model;

export const load = async () => {
  if (!model) model = await use.load();
  return model;
};

export const embedText = async (text) => {
  const m = await load();
  const v = await m.embed([text]);
  return Array.from(v.arraySync()[0]);
};