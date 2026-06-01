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

  let model = null;
  let variant = null;

  // 🔥 MODEL MATCH (quan trọng nhất)
  const modelFuse = new Fuse(models, {
    keys: ["name", "aliases"],
    threshold: 0.4,
  });

  const m = modelFuse.search(text);
  if (m.length) model = m[0].item;

  // 🔥 VARIANT MATCH
  const variantFuse = new Fuse(variants, {
    keys: ["variantName", "aliases"],
    threshold: 0.35,
  });

  const v = variantFuse.search(text);
  if (v.length) variant = v[0].item;

  // fallback: nếu không có model nhưng có variant → lấy model từ variant
  if (!model && variant?.modelId) {
    model = variant.modelId;
  }

  // seats intent
  let seats = null;
  if (text.includes("7 cho")) seats = 7;
  if (text.includes("5 cho")) seats = 5;

  // budget parse
  let budget = null;
  const match = text.match(/(\d+)\s*(ty|trieu)/i);
  if (match) {
    let val = Number(match[1]);
    if (match[2] === "ty") val *= 1e9;
    if (match[2] === "trieu") val *= 1e6;
    budget = val;
  }

  return {
    model,
    variant,
    seats,
    budget,
  };
};

export default entityEngine;