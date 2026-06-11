import VehicleModel from "../models/VehicleModel.js";
import Variant from "../models/Variant.js";
import { cleanText } from "../utils/cleanText.js";
import { compare } from "../utils/similarity.js";

export const processSemanticAI = async (message, memory = {}) => {

  const msg = cleanText(message);

  let intent = "DEFAULT";

  const entities = {
    modelName: memory.modelName || null,
    variantName: memory.variantName || null,
    color: null,
    feature: null,
    vin: null,
    seats: null,
    minBudget: null,
    maxBudget: null
  };

  // ================= INTENT =================
  if (msg.includes("gia") || msg.includes("bao nhieu"))
    intent = "PRICE_QUERY";

  if (msg.includes("ton kho") || msg.includes("con hang"))
    intent = "STOCK_QUERY";

  if (msg.includes("mau"))
    intent = "COLOR_QUERY";

  if (msg.includes("thong so") || msg.includes("camera") || msg.includes("adas"))
    intent = "SPECS_QUERY";

  if (msg.includes("loi") || msg.includes("giat so"))
    intent = "TECHNICAL_SUPPORT";

  if (msg.includes("tu van"))
    intent = "CONSULTING_QUERY";

  if (msg.includes("tin tuc"))
    intent = "NEWS_QUERY";

  // =============== MODEL DETECT ===============
  const models = await VehicleModel.find({});

  for (const m of models) {
    const name = cleanText(m.name);
    if (msg.includes(name)) {
      entities.modelName = m.name;
      break;
    }
  }

  // =============== VARIANT DETECT ===============
  const variants = await Variant.find({});

  let best = null;
  let bestScore = 0;

  for (const v of variants) {
    const score = compare(msg, cleanText(v.variantName));

    if (score > 0.85 && score > bestScore) {
      best = v.variantName;
      bestScore = score;
    }
  }

  if (best) entities.variantName = best;

  // ================= COLOR =================
  if (msg.includes("do")) entities.color = "đỏ";
  if (msg.includes("den")) entities.color = "đen";
  if (msg.includes("trang")) entities.color = "trắng";

  // ================= SEATS =================
  if (msg.includes("5 cho")) entities.seats = 5;
  if (msg.includes("7 cho")) entities.seats = 7;

  // ================= BUDGET =================
  const nums = msg.match(/\d+/g);
  if (nums?.length) {
    const value = parseInt(nums[0]);

    if (msg.includes("ty")) {
      entities.minBudget = value * 1e9;
    } else {
      entities.maxBudget = value * 1e6;
    }
  }

  // ================= 🔥 FIX CRITICAL RESOLUTION =================

  // auto resolve model from variant
  if (entities.variantName && !entities.modelName) {
    const v = await Variant.findOne({
      variantName: new RegExp(entities.variantName, "i")
    }).populate("modelId");

    if (v?.modelId) {
      entities.modelName = v.modelId.name;
    }
  }

  // auto resolve variant from model + keyword
  if (entities.modelName && !entities.variantName) {
    const model = await VehicleModel.findOne({
      name: new RegExp(entities.modelName, "i")
    });

    if (model) {
      const list = await Variant.find({ modelId: model._id });

      const match = list.find(v =>
        msg.includes(cleanText(v.variantName))
      );

      if (match) {
        entities.variantName = match.variantName;
      }
    }
  }

  // ================= INTENT OVERRIDE (CRITICAL FIX) =================
  if (entities.vin) intent = "STOCK_QUERY";
  if (entities.feature) intent = "SPECS_QUERY";
  if (entities.color) intent = "COLOR_QUERY";
  if (entities.seats || entities.minBudget || entities.maxBudget)
    intent = "CONSULTING_QUERY";

  return { intent, entities };
};