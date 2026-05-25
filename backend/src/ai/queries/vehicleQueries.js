import VehicleModel from "../../models/VehicleModel.js";
import Variant from "../../models/Variant.js";

export const getVehiclePrice = async (
  modelName,
  variant
) => {
  const model =
    await VehicleModel.findOne({
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

  let selected = variants[0];

  if (variant) {
    const found = variants.find((v) =>
      v.variantName
        .toLowerCase()
        .includes(
          variant.variantName.toLowerCase()
        )
    );

    if (found) {
      selected = found;
    }
  }

  return {
    model,
    variants,
    minPrice:
      selected?.basePrice || 0,
  };
};

export const getVehicleSuggestions =
  async (entities) => {
    let vehicles =
      await VehicleModel.find();

    if (entities.seats) {
      vehicles = vehicles.filter(
        (v) =>
          v.seats ===
          entities.seats
      );
    }

    if (entities.budget) {
      vehicles = vehicles.filter(
        (v) =>
          v.basePrice <=
          entities.budget
      );
    }

    if (entities.tags.length) {
      vehicles = vehicles.filter(
        (v) =>
          entities.tags.every((tag) =>
            v.tags?.includes(tag)
          )
      );
    }

    return vehicles.slice(0, 5);
  };

export const compareVehiclesService =
  async (entities) => {
    if (
      entities.compareModels.length < 2
    ) {
      return null;
    }

    return {
      a: entities.compareModels[0],
      b: entities.compareModels[1],
    };
  };

export const getVehicleSpecs =
  async (entities) => {
    return entities.model;
  };
