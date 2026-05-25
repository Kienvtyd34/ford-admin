import detectIntent from "./intentDetector.js";
import extractEntities from "./entityExtractor.js";
import { generateResponse } from "./responseGenerator.js";

import {
  getVehiclePrice,
  getVehicleSuggestions,
  compareVehiclesService,
  getVehicleSpecs,
} from "../queries/vehicleQueries.js";

import {
  findInventory,
} from "../queries/inventoryQueries.js";

import {
  findCarProblem,
} from "../queries/problemQueries.js";

import {
  faqService,
} from "../services/faqService.js";

import contextManager from "./contextManager.js";

export const semanticAI = async (
  userId,
  message
) => {
  const intentData =
    detectIntent(message);

  const entities =
    await extractEntities(message);

  const oldContext =
    contextManager.getContext(userId);

  const mergedEntities = {
    ...(oldContext?.entities || {}),
    ...entities,
  };

  contextManager.saveContext(userId, {
    entities: mergedEntities,
    intent: intentData.intent,
  });

  // FAQ

  const faq = faqService(message);

  if (faq) {
    return {
      intent: "FAQ",
      message: faq,
    };
  }

  switch (intentData.intent) {
    // =====================
    // PRICE
    // =====================

    case "PRICE_QUERY": {
      if (!mergedEntities.model) {
        return {
          message:
            "🚗 Bạn muốn xem giá xe nào?",
        };
      }

      const vehicle =
        await getVehiclePrice(
          mergedEntities.model.name,
          mergedEntities.variant
        );

      if (!vehicle) {
        return {
          message:
            "❌ Không tìm thấy xe",
        };
      }

      return {
        intent: intentData.intent,
        confidence:
          intentData.confidence,
        entities: mergedEntities,
        data: vehicle,
        message: generateResponse({
          intent: intentData.intent,
          data: vehicle,
        }),
      };
    }

    // =====================
    // SUGGESTION
    // =====================

    case "VEHICLE_SUGGESTION": {
      const vehicles =
        await getVehicleSuggestions(
          mergedEntities
        );

      return {
        intent: intentData.intent,
        confidence:
          intentData.confidence,
        entities: mergedEntities,
        data: vehicles,
        message: generateResponse({
          intent: intentData.intent,
          data: vehicles,
        }),
      };
    }

    // =====================
    // COMPARE
    // =====================

    case "COMPARE": {
      const compare =
        await compareVehiclesService(
          mergedEntities
        );

      if (!compare) {
        return {
          message:
            "⚠️ Vui lòng nhập 2 mẫu xe cần so sánh.",
        };
      }

      return {
        intent: intentData.intent,
        confidence:
          intentData.confidence,
        entities: mergedEntities,
        data: compare,
        message: generateResponse({
          intent: intentData.intent,
          data: compare,
        }),
      };
    }

    // =====================
    // INVENTORY
    // =====================

    case "INVENTORY_CHECK": {
      const inventory =
        await findInventory(
          mergedEntities
        );

      return {
        intent: intentData.intent,
        confidence:
          intentData.confidence,
        entities: mergedEntities,
        data: inventory,
        message: generateResponse({
          intent: intentData.intent,
          data: inventory,
        }),
      };
    }

    // =====================
    // SPEC
    // =====================

    case "VEHICLE_SPEC": {
      const specs =
        await getVehicleSpecs(
          mergedEntities
        );

      return {
        intent: intentData.intent,
        confidence:
          intentData.confidence,
        entities: mergedEntities,
        data: specs,
        message: generateResponse({
          intent: intentData.intent,
          data: specs,
        }),
      };
    }

    // =====================
    // TECH SUPPORT
    // =====================

    case "TECH_SUPPORT": {
      const problem =
        await findCarProblem(message);

      if (!problem) {
        return {
          message:
            "⚠️ Tôi chưa xác định được lỗi xe.",
        };
      }

      return {
        intent: intentData.intent,
        confidence:
          intentData.confidence,
        entities: mergedEntities,
        data: problem,
        message: generateResponse({
          intent: intentData.intent,
          data: problem,
        }),
      };
    }

    // =====================
    // GREETING
    // =====================

    case "GREETING": {
      return {
        intent: intentData.intent,
        confidence:
          intentData.confidence,
        entities: mergedEntities,
        message:
          "👋 Xin chào! Tôi là Ford AI Assistant.",
      };
    }

    default:
      return {
        intent: "UNKNOWN",
        confidence: 0,
        entities: mergedEntities,
        message:
          "🤖 Xin lỗi, tôi chưa hiểu yêu cầu của bạn.",
      };
  }
};

export default semanticAI;
