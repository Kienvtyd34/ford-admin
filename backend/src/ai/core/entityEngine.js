import Fuse from "fuse.js";
import VehicleModel from "../../models/VehicleModel.js";
import Variant from "../../models/Variant.js";
import { normalize } from "../utils/normalize.js";

export const entityEngine = async (message, context = null) => {
  const text = normalize(message);

  const models = await VehicleModel.find();
  const variants = await Variant.find().populate("modelId");

  let model = null;
  let variant = null;

  // 1. search model
  const modelFuse = new Fuse(models, {
    keys: ["name", "aliases"],
    threshold: 0.4,
  });

  const m = modelFuse.search(text);
  if (m.length) model = m[0].item;

  // 2. fallback CONTEXT MODEL (🔥 FIX QUAN TRỌNG)
  if (!model && context?.entities?.model) {
    model = context.entities.model;
  }

  // 3. variant search
  const variantFuse = new Fuse(variants, {
    keys: ["variantName", "aliases"],
    threshold: 0.35,
  });

  const v = variantFuse.search(text);
  if (v.length) variant = v[0].item;

  let seats = null;
  if (text.includes("7 cho")) seats = 7;
  if (text.includes("5 cho")) seats = 5;

  return {
    model,
    variant,
    seats,
  };
};

export default entityEngine;