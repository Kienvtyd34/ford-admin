import Variant from "../../models/Variant.js";

export default async (entities) => {
  const query = {};

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

  // 🔥 GROUP BY MODEL (FIX spam)
  const grouped = {};

  data.forEach(v => {
    const key = v.modelId?._id.toString();

    if (!grouped[key]) {
      grouped[key] = {
        name: v.modelId?.name,
        items: [],
      };
    }

    grouped[key].items.push(v);
  });

  return {
    intent: "SUGGEST",
    message: Object.values(grouped)
      .map(g =>
        `🚗 ${g.name}\n` +
        g.items
          .slice(0, 3)
          .map(v =>
            `• ${v.variantName} - ${v.basePrice.toLocaleString("vi-VN")} VNĐ`
          )
          .join("\n")
      )
      .join("\n\n"),
  };
};