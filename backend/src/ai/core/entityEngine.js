import VehicleModel from "../../models/VehicleModel.js";
import Variant from "../../models/Variant.js";
import { normalize } from "../utils/normalize.js";

const tokenize = (str) =>
  normalize(str).split(" ").filter(Boolean);

export const entityEngine = async (message) => {
  const text = normalize(message);
  const tokens = tokenize(message);

  const models = await VehicleModel.find();
  const variants = await Variant.find().populate("modelId");

  const out = {
    model: null,
    variant: null,
    budget: null,
    seats: null,
  };

  // ================= MODEL MATCH (FIX REAL DB) =================
  for (const m of models) {
    const nameTokens = tokenize(m.name);

    const hit =
      nameTokens.some(t => text.includes(t)) ||
      tokens.some(t => m.name.toLowerCase().includes(t));

    if (hit) {
      out.model = m;
      break;
    }
  }

  // ================= VARIANT MATCH =================
  for (const v of variants) {
    const nameTokens = tokenize(v.variantName);

    const hit =
      nameTokens.some(t => text.includes(t)) ||
      tokens.some(t => v.variantName.toLowerCase().includes(t));

    if (hit) {
      out.variant = v;
      out.model = v.modelId;
      break;
    }
  }

  // ================= SEATS =================
  if (text.includes("7 cho")) out.seats = 7;
  if (text.includes("5 cho")) out.seats = 5;

  // ================= BUDGET =================
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