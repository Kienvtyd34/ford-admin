import Variant from "../../models/Variant.js";

export default async (entities) => {
  if (!entities.model) {
    const all = await Variant.find().populate("modelId");

    return {
      intent: "PRICE",
      message:
        "🚗 Bạn muốn xem dòng nào?\n" +
        [...new Set(all.map(v => v.modelId.name))].join("\n"),
    };
  }

  const variants = await Variant.find({
    modelId: entities.model._id,
  });

  if (!variants.length) {
    return {
      intent: "PRICE",
      message: "❌ Không tìm thấy phiên bản",
    };
  }

  const v = variants[0];

  return {
    intent: "PRICE",
    message: `🚗 ${entities.model.name}
💰 Từ: ${v.basePrice.toLocaleString("vi-VN")} VNĐ`,
  };
};