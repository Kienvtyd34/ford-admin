import VehicleModel from "../../models/VehicleModel.js";
import Variant from "../../models/Variant.js";

// =======================================
// PRICE
// =======================================

export const getVehiclePrice = async (
  modelName,
  variantEntity,
  isOnRoad = false
) => {

  const model =
    await VehicleModel.findOne({
      name: {
        $regex: modelName,
        $options: "i",
      },
    });

  if (!model) return null;

  const variants =
    await Variant.find({
      modelId: model._id,
    }).sort({
      basePrice: 1,
    });

  if (!variants.length) {
    return null;
  }

  // =========================
  // FIND VARIANT
  // =========================

  let selectedVariant =
    variants[0];

  if (variantEntity) {

    const found =
      variants.find((v) => {

        return v.variantName
          .toLowerCase()
          .includes(
            variantEntity.variantName.toLowerCase()
          );
      });

    if (found) {
      selectedVariant = found;
    }
  }

  // =========================
  // PRICE
  // =========================

  const basePrice =
    selectedVariant.basePrice;

  // giả lập lăn bánh

  const onRoadPrice =
    Math.round(
      basePrice * 1.12
    );

  return {
    model,

    variants,

    selectedVariant,

    minPrice:
      variants[0].basePrice,

    basePrice,

    onRoadPrice,

    isOnRoad,
  };
};

// =======================================
// SUGGESTION
// =======================================

export const getVehicleSuggestions =
  async (
    entities,
    message = ""
  ) => {

    const text =
      message.toLowerCase();

    const models =
      await VehicleModel.find();

    const variants =
      await Variant.find()
        .populate("modelId");

    // =========================
    // FILTER BY BUDGET
    // =========================

    if (entities.budget) {

      const matched =
        variants.filter((v) => {

          return (
            v.basePrice <=
            entities.budget
          );
        });

      return matched.map((v) => ({
        name:
          v.modelId?.name,

        variant:
          v.variantName,

        basePrice:
          v.basePrice,
      }));
    }

    // =========================
    // 7 SEATS
    // =========================

    if (
      text.includes("7 cho") ||
      text.includes("gia dinh")
    ) {

      return models.filter(
        (m) => m.seats >= 7
      );
    }

    // =========================
    // PICKUP
    // =========================

    if (
      text.includes("cong trinh") ||
      text.includes("ban tai")
    ) {

      return models.filter(
        (m) =>
          m.type ===
          "Pick-up"
      );
    }

    // =========================
    // CITY
    // =========================

    if (
      text.includes("di pho")
    ) {

      return models.filter(
        (m) =>
          m.type === "SUV"
      );
    }

    return models.slice(0, 5);
  };

// =======================================
// COMPARE
// =======================================

export const compareVehiclesService =
  async (entities) => {

    if (
      !entities.compareModels ||
      entities.compareModels.length < 2
    ) {

      return null;
    }

    return {
      a:
        entities.compareModels[0],

      b:
        entities.compareModels[1],
    };
  };

// =======================================
// SPECS
// =======================================

export const getVehicleSpecs =
  async (entities) => {

    if (!entities.model) {
      return null;
    }

    return {
      name:
        entities.model.name,

      seats:
        entities.model.seats,

      engine:
        entities.model.specs
          ?.engine ||
        "Đang cập nhật",

      fuelType:
        entities.model.specs
          ?.fuelType ||
        "Đang cập nhật",

      wheel:
        entities.model.specs
          ?.wheel ||
        "Đang cập nhật",

      features: [
        "ABS",
        "Camera 360",
        "ADAS",
      ],
    };
  };