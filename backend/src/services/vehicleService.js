import Variant from "../models/Variant.js";
import VehicleModel from "../models/VehicleModel.js";

export const getVariantsByModel = async (modelName) => {
  const model = await VehicleModel.findOne({
    name: new RegExp(modelName, "i")
  });

  if (!model) return [];

  return await Variant.find({ modelId: model._id }).populate("modelId");
};

export const getVariant = async (variantName) => {
  return await Variant.findOne({
    variantName: new RegExp(variantName, "i")
  }).populate("modelId");
};