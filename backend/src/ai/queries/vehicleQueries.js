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

    // =====================================
    // BUDGET
    // =====================================

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

        reason:
          "Phù hợp ngân sách",

        basePrice:
          v.basePrice,
      }));
    }

    // =====================================
    // FAMILY / 7 SEATS
    // =====================================

    if (
      text.includes("gia dinh") ||
      text.includes("7 cho") ||
      text.includes("rong rai")
    ) {

      const everest =
        models.find((m) =>
          m.name
            .toLowerCase()
            .includes("everest")
        );

      const territory =
        models.find((m) =>
          m.name
            .toLowerCase()
            .includes("territory")
        );

      return [
        {
          name:
            everest?.name,

          reason:
            "SUV 7 chỗ rộng rãi, phù hợp gia đình và du lịch",

          basePrice:
            1099000000,
        },

        {
          name:
            territory?.name,

          reason:
            "SUV tiện nghi, tiết kiệm nhiên liệu",

          basePrice:
            822000000,
        },
      ];
    }

    // =====================================
    // DU LỊCH
    // =====================================

    if (
      text.includes("du lich")
    ) {

      const everest =
        models.find((m) =>
          m.name
            .toLowerCase()
            .includes("everest")
        );

      return [
        {
          name:
            everest?.name,

          reason:
            "Khung gầm chắc chắn, đi đường dài tốt",

          basePrice:
            1099000000,
        },
      ];
    }

    // =====================================
    // CÔNG TRÌNH / BÁN TẢI
    // =====================================

    if (
      text.includes("cong trinh") ||
      text.includes("ban tai")
    ) {

      const ranger =
        models.find((m) =>
          m.name
            .toLowerCase()
            .includes("ranger")
        );

      return [
        {
          name:
            ranger?.name,

          reason:
            "Bán tải mạnh mẽ, tải tốt, phù hợp công trình",

          basePrice:
            665000000,
        },
      ];
    }

    // =====================================
    // ĐI PHỐ
    // =====================================

    if (
      text.includes("di pho")
    ) {

      const territory =
        models.find((m) =>
          m.name
            .toLowerCase()
            .includes("territory")
        );

      return [
        {
          name:
            territory?.name,

          reason:
            "Kích thước vừa phải, phù hợp đô thị",

          basePrice:
            822000000,
        },
      ];
    }

    // =====================================
    // TIẾT KIỆM
    // =====================================

    if (
      text.includes("tiet kiem")
    ) {

      const territory =
        models.find((m) =>
          m.name
            .toLowerCase()
            .includes("territory")
        );

      return [
        {
          name:
            territory?.name,

          reason:
            "Tiết kiệm nhiên liệu và chi phí vận hành",

          basePrice:
            822000000,
        },
      ];
    }

    // =====================================
    // DEFAULT
    // =====================================

    return [
      {
        name:
          "Ford Everest",

        reason:
          "Mẫu SUV nổi bật của Ford",

        basePrice:
          1099000000,
      },
    ];
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