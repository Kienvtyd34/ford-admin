import Variant from "../../models/Variant.js";

export default async (entities) => {
  try {
    if (!entities?.model?._id) {
      return {
        intent: "PRICE",
        message: "🚗 Bạn muốn xem Ford Everest, Ranger hay Territory?",
      };
    }

    const variants = await Variant.find({
      modelId: entities.model._id,
    }).populate("modelId");

    if (!variants.length) {
      return {
        intent: "PRICE",
        message: `❌ Không tìm thấy phiên bản của ${entities.model.name}`,
      };
    }

    return {
      intent: "PRICE",
      message: variants
        .map(v =>
          `🚗 ${v.modelId.name} ${v.variantName} - ${v.basePrice.toLocaleString("vi-VN")} VNĐ`
        )
        .join("\n"),
    };

  } catch (err) {
    return {
      intent: "PRICE",
      message: "❌ Lỗi hệ thống giá xe",
    };
  }
};