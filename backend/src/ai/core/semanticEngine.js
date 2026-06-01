import detectIntent from "./intentDetector.js";
import extractEntities from "./entityExtractor.js";
import {
  getVehiclePrice,
  getVehicleSuggestions,
  findInventory,
} from "../queries/vehicleQueries.js";

import { findCarProblem } from "../queries/inventoryQueries.js";

export const semanticAI = async (userId, message) => {
  const intent = detectIntent(message);
  const entities = await extractEntities(message);

  // ================= FALLBACK PRICE =================
  if (intent.intent === "PRICE_QUERY") {
    const modelName = entities.model?.name || message;

    const data = await getVehiclePrice(modelName);

    if (!data) {
      return {
        success: false,
        message: "❌ Không tìm thấy xe.",
      };
    }

    return {
      success: true,
      data,
      message: `Giá ${data.model} từ ${data.minPrice}`,
    };
  }

  // ================= SUGGEST FALLBACK =================
  if (intent.intent === "UNKNOWN") {
    const suggest = await getVehicleSuggestions(entities);

    return {
      success: true,
      message: "🚗 Gợi ý xe phù hợp",
      data: suggest,
    };
  }

  // ================= TECH =================
  if (intent.intent === "TECH_SUPPORT") {
    const p = await findCarProblem(message);

    return {
      success: !!p,
      data: p,
      message: p ? "Đã tìm thấy lỗi" : "Không có dữ liệu lỗi",
    };
  }

  return {
    success: false,
    message: "Không hiểu yêu cầu",
  };
};

export default semanticAI;