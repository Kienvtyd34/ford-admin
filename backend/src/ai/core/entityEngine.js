import Fuse from "fuse.js";
import VehicleModel from "../../models/VehicleModel.js";
import Variant from "../../models/Variant.js";
import { normalize } from "../utils/normalize.js";

const resolveModel = (text, models) => {
  const t = text.toLowerCase();

  // 1. HARD MATCH (QUAN TRỌNG NHẤT)
  for (const m of models) {
    if (t.includes(m.name.toLowerCase())) return m;
    if (m.aliases?.length) {
      for (const a of m.aliases) {
        if (t.includes(a.toLowerCase())) return m;
      }
    }
  }

  // 2. KEYWORD MATCH (FORD SHORT NAME)
  const keywords = [
    { key: "everest", match: "Everest" },
    { key: "ranger", match: "Ranger" },
    { key: "territory", match: "Territory" },
    { key: "transit", match: "Transit" },
  ];

  for (const k of keywords) {
    if (t.includes(k.key)) {
      return models.find(m =>
        m.name.toLowerCase().includes(k.match.toLowerCase())
      );
    }
  }

  // 3. FUZZY FALLBACK
  const fuse = new Fuse(models, {
    keys: ["name"],
    threshold: 0.6,
  });

  const result = fuse.search(text);
  return result[0]?.item || null;
};

export const entityEngine = async (message, context = null) => {
  const text = normalize(message);

  const models = await VehicleModel.find();
  const variants = await Variant.find().populate("modelId");

  let model = resolveModel(text, models);

  // fallback context
  if (!model && context?.entities?.model) {
    model = context.entities.model;
  }

  const variantFuse = new Fuse(variants, {
    keys: ["variantName", "aliases"],
    threshold: 0.4,
  });

  const v = variantFuse.search(text);
  const variant = v[0]?.item || null;

  return {
    model,
    variant,
    raw: text,
  };
};

export default entityEngine;