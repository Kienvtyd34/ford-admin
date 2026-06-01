import Variant from "../../models/Variant.js";

export default async (entities) => {
  if (!entities.model) {
    return {
      intent: "PRICE",
      message: "🚗 Bạn muốn xem giá Ford Everest, Ranger hay Territory?",
    };
  }

  const variants = await Variant.find({
    modelId: entities.model._id,
  });

  if (!variants.length) {
    return {
      intent: "PRICE",
      message: "❌ Không tìm thấy phiên bản phù hợp",
    };
  }

  const selected = variants[0];

  return {
    intent: "PRICE",
    message: `🚗 ${entities.model.name}
💰 Từ: ${selected.basePrice.toLocaleString("vi-VN")} VNĐ`,
  };
};