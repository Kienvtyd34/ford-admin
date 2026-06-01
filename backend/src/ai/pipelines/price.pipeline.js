import Variant from "../../models/Variant.js";

export default async (entities) => {
  try {
    // ❌ FIX: không có model → fallback list ALL models
    if (!entities?.model?._id) {
      const variants = await Variant.find().populate("modelId");

      const models = [...new Set(variants.map(v => v.modelId?.name))];

      return {
        intent: "PRICE",
        message:
          "🚗 Bạn muốn xem dòng nào?\n" +
          models.join("\n"),
      };
    }

    const variants = await Variant.find({
      modelId: entities.model._id,
    });

    if (!variants || variants.length === 0) {
      return {
        intent: "PRICE",
        message: "❌ Không tìm thấy phiên bản phù hợp",
      };
    }

    const v = variants[0];

    return {
      intent: "PRICE",
      message: `🚗 ${entities.model.name}
💰 Từ: ${v.basePrice.toLocaleString("vi-VN")} VNĐ`,
    };
  } catch (err) {
    return {
      intent: "PRICE",
      message: "⚠️ Lỗi khi lấy dữ liệu giá xe",
    };
  }
};