import Variant from "../../models/Variant.js";

export default async (entities) => {
  if (!entities?.model?._id) {
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
      message: "❌ Không tìm thấy phiên bản xe",
    };
  }

  const min = Math.min(...variants.map(v => v.basePrice));
  const max = Math.max(...variants.map(v => v.basePrice));

  return {
    intent: "PRICE",
    message: `🚗 ${entities.model.name}
💰 Giá: ${min.toLocaleString("vi-VN")} - ${max.toLocaleString("vi-VN")} VNĐ`,
  };
};