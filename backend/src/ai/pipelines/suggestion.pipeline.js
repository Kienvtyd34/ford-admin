import Variant from "../../models/Variant.js";

export default async (entities) => {
  const q = {};

  if (entities.budget) q.basePrice = { $lte: entities.budget };
  if (entities.seats) q["specs.seats"] = entities.seats;

  const data = await Variant.find(q).populate("modelId");

  if (!data.length) {
    return {
      intent: "SUGGEST",
      message: "❌ Không tìm thấy xe phù hợp",
    };
  }

  return {
    intent: "SUGGEST",
    message: data.map(v =>
      `🚗 ${v.modelId?.name} ${v.variantName}\n💰 ${v.basePrice.toLocaleString("vi-VN")} VNĐ`
    ).join("\n\n"),
  };
};