import Fuse from "fuse.js";
import VehicleModel from "../../models/VehicleModel.js";
import Variant from "../../models/Variant.js";
import { normalize } from "../utils/normalize.js";

const buildFuse = (data, keys) =>
  new Fuse(data, {
    keys,
    threshold: 0.3,
    ignoreLocation: true,
  });

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

  // ======================
  // MODEL MATCH (FIXED)
  // ======================
  const modelFuse = buildFuse(models, ["name", "slug", "aliases"]);

  let m = modelFuse.search(text);

  if (!m.length) {
    // fallback: manual contains (VERY IMPORTANT FIX)
    m = models
      .filter(v => text.includes(normalize(v.name)))
      .map(v => ({ item: v }));
  }

  if (m.length) out.model = m[0].item;

  // ======================
  // VARIANT MATCH
  // ======================
  const variantFuse = buildFuse(variants, [
    "variantName",
    "aliases",
    "modelId.name",
  ]);

  const v = variantFuse.search(text);
  if (v.length) out.variant = v[0].item;

  // ======================
  // SEATS FIX (your DB has specs.seats)
  // ======================
  if (text.includes("7 cho") || text.includes("7 chỗ")) out.seats = 7;
  if (text.includes("5 cho") || text.includes("5 chỗ")) out.seats = 5;

  // ======================
  // BUDGET FIX
  // ======================
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