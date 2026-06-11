import VehicleModel from "../models/VehicleModel.js";
import Variant from "../models/Variant.js";

export const getVariant = async (variantName) => {
  if (!variantName) return null;

  return await Variant.findOne({
    variantName: new RegExp(variantName, "i")
  }).populate("modelId");
};

export const getVariantsByModel = async (modelName) => {
  const model = await VehicleModel.findOne({
    name: new RegExp(modelName, "i")
  });

  if (!model) return [];

  return await Variant.find({ modelId: model._id });
};