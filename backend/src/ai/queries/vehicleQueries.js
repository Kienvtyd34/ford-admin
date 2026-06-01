import VehicleModel from "../../models/VehicleModel.js";
import Variant from "../../models/Variant.js";
import Inventory from "../../models/Inventory.js";
import cache from "../../../src/utils/cacheEngine.js";

// ================= PRICE =================
export const getVehiclePrice = async (modelName) => {
  if (!modelName) return null;

  const key = `price_${modelName}`;
  const cached = cache.getCache(key);
  if (cached) return cached;

  const model = await VehicleModel.findOne({
    $or: [
      { name: { $regex: modelName, $options: "i" } },
      { slug: { $regex: modelName, $options: "i" } },
    ],
  });

  if (!model) return null;

  const variants = await Variant.find({ modelId: model._id });

  const result = {
    model: model.name,
    minPrice: Math.min(...variants.map(v => v.basePrice || 0)),
    maxPrice: Math.max(...variants.map(v => v.basePrice || 0)),
    variants,
  };

  cache.setCache(key, result, 600000);
  return result;
};

// ================= SUGGEST =================
export const getVehicleSuggestions = async (entities) => {
  const q = {};

  if (entities.budget) q.basePrice = { $lte: entities.budget };
  if (entities.seats) q["specs.seats"] = entities.seats;

  const data = await Variant.find(q).populate("modelId");

  return data.map(v => ({
    model: v.modelId?.name,
    variant: v.variantName,
    price: v.basePrice,
  }));
};

// ================= INVENTORY =================
export const findInventory = async (entities) => {
  const data = await Inventory.find({ status: "Trong kho" })
    .populate({
      path: "variantId",
      populate: { path: "modelId" },
    })
    .populate("colorId");

  return data.filter(i => {
    const model = i.variantId?.modelId;

    if (entities.model && model) {
      return model.name
        .toLowerCase()
        .includes(entities.model.name.toLowerCase());
    }

    return true;
  });
};