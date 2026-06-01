import Fuse from "fuse.js";
import VehicleModel from "../../models/VehicleModel.js";
import Variant from "../../models/Variant.js";
import { normalize } from "../utils/normalize.js";

export const entityEngine = async (message, context = null) => {
  const text = normalize(message);

  const [models, variants] = await Promise.all([
    VehicleModel.find(),
    Variant.find().populate("modelId"),
  ]);

  let model = null;
  let variant = null;

  // ===== MODEL MATCH =====
  const modelFuse = new Fuse(models, {
    keys: ["name", "aliases", "brand"],
    threshold: 0.35,
  });

  const m = modelFuse.search(text);
  if (m.length) model = m[0].item;

  // 🔥 FIX: fallback context
  if (!model && context?.entities?.model) {
    model = context.entities.model;
  }

  // 🔥 FIX: keyword hard mapping (QUAN TRỌNG)
  const keywordMap = [
    { key: "everest", name: "Everest" },
    { key: "ranger", name: "Ranger" },
    { key: "territory", name: "Territory" },
  ];

  for (const k of keywordMap) {
    if (text.includes(k.key)) {
      const found = models.find(m => m.name.includes(k.name));
      if (found) model = found;
    }
  }

  // ===== VARIANT MATCH =====
  const variantFuse = new Fuse(variants, {
    keys: ["variantName", "aliases"],
    threshold: 0.3,
  });

  const v = variantFuse.search(text);
  if (v.length) variant = v[0].item;

  // ===== SEATS =====
  let seats = null;
  if (text.includes("7 cho")) seats = 7;
  if (text.includes("5 cho")) seats = 5;

  return {
    model,
    variant,
    seats,
    raw: text,
  };
};

export default entityEngine;