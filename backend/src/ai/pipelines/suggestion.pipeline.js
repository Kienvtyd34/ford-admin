import Variant from "../../models/Variant.js";

export default async (entities) => {
  const query = {};

  if (entities.budget) query.basePrice = { $lte: entities.budget };
  if (entities.seats) query["specs.seats"] = entities.seats;

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
      .map(v => `🚗 ${v.modelId?.name || "Xe"} - ${v.basePrice.toLocaleString("vi-VN")}`)
      .join("\n"),
  };
};