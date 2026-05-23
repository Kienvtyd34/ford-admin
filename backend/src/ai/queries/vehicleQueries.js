import VehicleModel from "../../models/VehicleModel.js";
import Variant from "../../models/Variant.js";

export const getVehiclePrice = async (modelName) => {
  const model = await VehicleModel.findOne({
    name: {
      $regex: modelName,
      $options: "i",
    },
  });

  if (!model) return null;

  const variants = await Variant.find({
    modelId: model._id,
  }).sort({
    basePrice: 1,
  });

  return {
    model,
    variants,
    minPrice: variants[0]?.basePrice || 0,
  };
};

export const getVehicleSuggestions = async (entities) => {
  let query = {};

  if (entities.seats) {
    query.seats = entities.seats;
  }

  const vehicles = await VehicleModel.find(query);

  return vehicles;
};