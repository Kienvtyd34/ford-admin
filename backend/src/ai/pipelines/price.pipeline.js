import Variant from "../../models/Variant.js";

export default async (entities) => {
  const model = entities.model;

  if (!model?._id) {
    return {
      intent: "PRICE",
      message:
        "🚗 Bạn muốn xem giá Ford Everest, Ranger hay Territory?",
    };
  }

  const variants = await Variant.find({
    modelId: model._id,
  }).populate("modelId");

  if (!variants.length) {
    return {
      intent: "PRICE",
      message: `❌ Không tìm thấy phiên bản của ${model.name}`,
    };
  }

  return {
    intent: "PRICE",
    message:
      `🚗 ${model.name}\n` +
      variants
        .map(
          v =>
            `💰 ${v.variantName} - ${v.basePrice.toLocaleString("vi-VN")} VNĐ`
        )
        .join("\n"),
  };
};