import VehicleModel from "../../models/VehicleModel.js";
import Variant from "../../models/Variant.js";
import cache from "../utils/cacheEngine.js";
import Inventory from "../../models/Inventory.js";
import CarProblem from "../../models/CarProblem.js";
import { normalize } from "../../../src/utils/normalize.js";

// =======================================
// PRICE (CACHE + SAFE)
// =======================================
export const getVehiclePrice = async (modelName, variantEntity) => {
  if (!modelName) return null;

  const cacheKey = `price_${modelName}`;
  const cached = cache.getCache(cacheKey);
  if (cached) return cached;

  const model = await VehicleModel.findOne({
    name: { $regex: modelName, $options: "i" },
  });

  if (!model) return null;

  const variants = await Variant.find({
    modelId: model._id,
  }).sort({ basePrice: 1 });

  if (!variants.length) return null;

  const selectedVariant = variants[0];

  const result = {
    model,
    variants,
    selectedVariant,
    basePrice: selectedVariant.basePrice,
    onRoadPrice: Math.round(selectedVariant.basePrice * 1.12),
  };

  cache.setCache(cacheKey, result, 600000); // 10 min cache

  return result;
};

// =======================================
// SPEC
// =======================================
export const getVehicleSpecs = async (entities) => {
  if (!entities?.model && !entities?.variant) return null;

  let variant = entities.variant;

  if (!variant && entities.model) {
    variant = await Variant.findOne({
      modelId: entities.model._id,
    }).sort({ basePrice: -1 });
  }

  if (!variant) return null;

  return {
    variantName: variant.variantName,
    basePrice: variant.basePrice,
    transmission: variant.transmission,
    driveTrain: variant.driveTrain,
    fuelType: variant.fuelType,
    specs: variant.specs,
    features: variant.features,
  };
};

// =======================================
// FEATURE INFO
// =======================================
export const getFeatureInfo = async (entities) => {
  if (!entities?.variant || !entities?.feature) return null;

  const variant = await Variant.findById(entities.variant._id);
  if (!variant) return null;

  return {
    variantName: variant.variantName,
    feature: entities.feature,
    featureLabel: entities.feature,
    available: !!variant.features?.[entities.feature],
  };
};

// =======================================
// AI SUGGESTION + RANKING
// =======================================
export const getVehicleSuggestions = async (entities) => {
  const query = {};

  if (entities?.budget) {
    query.basePrice = { $lte: entities.budget };
  }

  if (entities?.seats) {
    query["specs.seats"] = entities.seats;
  }

  if (entities?.feature) {
    query[`features.${entities.feature}`] = true;
  }

  const variants = await Variant.find(query).populate("modelId");

  return variants.map((v) => ({
    name: v.modelId?.name,
    variantName: v.variantName,
    basePrice: v.basePrice,
    reason: "Phù hợp nhu cầu của bạn",
  }));
};

// =======================================
// COMPARE MODELS
// =======================================
export const compareVehiclesService = async (entities) => {
  if (!entities?.compareModels || entities.compareModels.length < 2)
    return null;

  const [a, b] = entities.compareModels;

  const variantA = await Variant.findOne({ modelId: a._id });
  const variantB = await Variant.findOne({ modelId: b._id });

  if (!variantA || !variantB) return null;

  return {
    a: {
      name: a.name,
      seats: variantA.specs?.seats,
      type: a.type,
    },
    b: {
      name: b.name,
      seats: variantB.specs?.seats,
      type: b.type,
    },
  };
};

// =======================================
// COMPARE VARIANTS
// =======================================
export const compareVariants = async (entities) => {
  if (!entities?.compareVariants || entities.compareVariants.length < 2)
    return null;

  const [v1, v2] = entities.compareVariants;

  const variantA = await Variant.findById(v1._id).populate("modelId");
  const variantB = await Variant.findById(v2._id).populate("modelId");

  if (!variantA || !variantB) return null;

  return { a: variantA, b: variantB };
};

// =======================================
// INVENTORY
// =======================================
export const findInventory = async (entities) => {
  const data = await Inventory.find({ status: "Trong kho" })
    .populate({
      path: "variantId",
      populate: { path: "modelId" },
    })
    .populate("colorId");

  return data.filter((item) => {
    const model = item.variantId?.modelId;
    const color = item.colorId;

    if (entities?.model) {
      if (
        !model?.name
          ?.toLowerCase()
          .includes(entities.model.name.toLowerCase())
      ) {
        return false;
      }
    }

    if (entities?.color) {
      if (
        !color?.name
          ?.toLowerCase()
          .includes(entities.color.name.toLowerCase())
      ) {
        return false;
      }
    }

    return true;
  });
};

// =======================================
// TECH PROBLEM
// =======================================
export const findCarProblem = async (message) => {
  const text = normalize(message);

  const problems = await CarProblem.find();

  for (const p of problems) {
    if (p.symptoms.some((s) => text.includes(normalize(s)))) {
      return p;
    }
  }

  return null;
};