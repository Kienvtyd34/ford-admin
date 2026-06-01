import Fuse from "fuse.js";
import VehicleModel from "../../models/VehicleModel.js";
import Variant from "../../models/Variant.js";
import { normalize } from "../utils/normalize.js";

export const entityEngine = async (message) => {
  const text = normalize(message);

  const [models, variants] = await Promise.all([
    VehicleModel.find(),
    Variant.find().populate("modelId"),
  ]);

  const out = {
    model: null,
    variant: null,
    budget: null,
    seats: null,
  };

  const modelFuse = new Fuse(models, {
    keys: ["name", "aliases"],
    threshold: 0.4,
  });

  const m = modelFuse.search(text);
  if (m.length) out.model = m[0].item;

  const variantFuse = new Fuse(variants, {
    keys: ["variantName", "aliases"],
    threshold: 0.35,
  });

  const v = variantFuse.search(text);
  if (v.length) out.variant = v[0].item;

  if (text.includes("7 cho")) out.seats = 7;
  if (text.includes("5 cho")) out.seats = 5;

  const budget = text.match(/(\d+)\s*(ty|trieu)/i);
  if (budget) {
    let val = Number(budget[1]);
    if (budget[2] === "ty") val *= 1e9;
    if (budget[2] === "trieu") val *= 1e6;
    out.budget = val;
  }

  return out;
};

export default entityEngine;