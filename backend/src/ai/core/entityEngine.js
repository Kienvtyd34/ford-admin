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

  // ==============================
  // 🔥 FIX 1: MODEL MATCH MẠNH HƠN
  // ==============================
  const modelFuse = new Fuse(models, {
    keys: ["name", "aliases", "brand"],
    threshold: 0.5,
  });

  const modelResult = modelFuse.search(text);
  if (modelResult.length) {
    model = modelResult[0].item;
  }

  // ==============================
  // 🔥 FIX 2: HARD KEYWORD OVERRIDE
  // (QUAN TRỌNG NHẤT)
  // ==============================
  const keywordMap = [
    { key: "everest", match: "Everest" },
    { key: "ranger", match: "Ranger" },
    { key: "territory", match: "Territory" },
    { key: "transit", match: "Transit" },
  ];

  for (const k of keywordMap) {
    if (text.includes(k.key)) {
      const found = models.find(m =>
        m.name.toLowerCase().includes(k.match.toLowerCase())
      );

      if (found) model = found;
    }
  }

  // ==============================
  // 🔥 FIX 3: CONTEXT FALLBACK
  // ==============================
  if (!model && context?.entities?.model) {
    model = context.entities.model;
  }

  // ==============================
  // VARIANT MATCH
  // ==============================
  const variantFuse = new Fuse(variants, {
    keys: ["variantName", "aliases"],
    threshold: 0.4,
  });

  const vResult = variantFuse.search(text);
  if (vResult.length) variant = vResult[0].item;

  // ==============================
  // SEATS
  // ==============================
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