import Variant from "../../models/Variant.js";

export default async (entities) => {
  const v = entities.variant;

  if (!v) {
    return {
      intent: "FEATURE",
      message: "❌ Không tìm thấy phiên bản",
    };
  }

  const feature = v.features?.[entities.feature];

  return {
    intent: "FEATURE",
    message: feature
      ? "✅ Có tính năng"
      : "❌ Không có tính năng",
  };
};