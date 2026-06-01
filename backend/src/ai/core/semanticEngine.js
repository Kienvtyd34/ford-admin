import detectIntent from "./intentDetector.js";
import extractEntities from "./entityExtractor.js";

import {
  getVehiclePrice,
  getVehicleSuggestions,
  findInventory,
} from "../queries/vehicleQueries.js";

import { findCarProblem } from "../queries/problemQueries.js";
import contextManager from "./contextManager.js";
import responseWrapper from "./responseWrapper.js";

export const semanticAI = async (userId, message) => {
  try {
    const intentData = detectIntent(message);
    const entities = await extractEntities(message);

    const oldContext = contextManager.getContext(userId);

    const mergedEntities = {
      ...(oldContext?.entities || {}),
      ...entities,
    };

    contextManager.saveContext(userId, {
      entities: mergedEntities,
      intent: intentData.intent,
    });

    // ================= PRICE =================
    if (intentData.intent === "PRICE_QUERY") {
      const modelName = mergedEntities.model?.name || message;

      const vehicle = await getVehiclePrice(modelName);

      if (!vehicle) {
        return responseWrapper({
          success: false,
          intent: "PRICE_QUERY",
          message: "❌ Không tìm thấy xe.",
        });
      }

      return responseWrapper({
        success: true,
        intent: "PRICE_QUERY",
        data: vehicle,
        message: `🚗 ${vehicle.model} từ ${vehicle.minPrice.toLocaleString()} VNĐ`,
      });
    }

    // ================= SUGGEST =================
    if (intentData.intent === "VEHICLE_SUGGESTION") {
      const data = await getVehicleSuggestions(mergedEntities);

      return responseWrapper({
        success: true,
        intent: "VEHICLE_SUGGESTION",
        data,
        message: "🚗 Gợi ý xe phù hợp",
      });
    }

    // ================= TECH =================
    if (intentData.intent === "TECH_SUPPORT") {
      const p = await findCarProblem(message);

      return responseWrapper({
        success: !!p,
        intent: "TECH_SUPPORT",
        data: p,
        message: p ? "Đã tìm thấy lỗi" : "Không có dữ liệu lỗi",
      });
    }

    // ================= INVENTORY =================
    if (intentData.intent === "INVENTORY_CHECK") {
      const data = await findInventory(mergedEntities);

      return responseWrapper({
        success: true,
        intent: "INVENTORY_CHECK",
        data,
        message: "📦 Danh sách xe trong kho",
      });
    }

    // ================= FALLBACK =================
    const fallback = await getVehicleSuggestions(mergedEntities);

    if (fallback?.length) {
      return responseWrapper({
        success: true,
        intent: "FALLBACK",
        data: fallback,
        message: "🚗 Gợi ý xe phù hợp với bạn",
      });
    }

    return responseWrapper({
      success: false,
      intent: "UNKNOWN",
      message: "🤖 Tôi chưa hiểu yêu cầu.",
    });

  } catch (err) {
    return responseWrapper({
      success: false,
      intent: "ERROR",
      message: "⚠️ Lỗi hệ thống",
      error: err.message,
    });
  }
};

export default semanticAI;