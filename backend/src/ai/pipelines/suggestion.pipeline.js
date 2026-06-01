import Variant from "../../models/Variant.js";

export default async (entities) => {
  try {
    const query = {};

    if (entities?.model?._id) {
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
          `🚗 ${v.modelId?.name} ${v.variantName} - ${v.basePrice.toLocaleString("vi-VN")} VNĐ`
        )
        .join("\n"),
    };

  } catch (err) {
    return {
      intent: "SUGGEST",
      message: "❌ Lỗi hệ thống gợi ý xe",
    };
  }
};