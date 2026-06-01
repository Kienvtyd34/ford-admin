import Variant from "../../models/Variant.js";

export default async (entities) => {
  const query = {};

  // 🔥 FIX: bắt buộc có model hoặc seats
  if (entities.model?._id) {
    query.modelId = entities.model._id;
  }

  if (entities.seats) {
    query["specs.seats"] = entities.seats;
  }

  const data = await Variant.find(query).populate("modelId");

  if (!data.length) {
    return {
      intent: "SUGGEST",
      message: "❌ Không tìm thấy xe phù hợp",
    };
  }

  return {
    intent: "SUGGEST",
    message: data
      .map(v =>
        `🚗 ${v.modelId?.name || "Xe"} - ${v.basePrice.toLocaleString("vi-VN")}`
      )
      .join("\n"),
  };
};