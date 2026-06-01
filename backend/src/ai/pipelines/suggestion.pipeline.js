import Variant from "../../models/Variant.js";

export default async (entities) => {
  try {
    const query = {};

    if (entities?.budget) query.basePrice = { $lte: entities.budget };
    if (entities?.seats) query["specs.seats"] = entities.seats;

    let data = await Variant.find(query).populate("modelId");

    // 🔥 FIX: fallback nếu rỗng
    if (!data.length) {
      data = await Variant.find().populate("modelId");
    }

    if (!data.length) {
      return {
        intent: "SUGGEST",
        message: "🚗 Không tìm thấy xe phù hợp",
      };
    }

    return {
      intent: "SUGGEST",
      message: data
        .slice(0, 5)
        .map(v => `🚗 ${v.modelId?.name} - ${v.basePrice.toLocaleString("vi-VN")}`)
        .join("\n"),
    };
  } catch (err) {
    return {
      intent: "SUGGEST",
      message: "⚠️ Lỗi hệ thống gợi ý xe",
    };
  }
};