import detectIntent from "./intentDetector.js";
import extractEntities from "./entityExtractor.js";
import { generateResponse } from "./responseGenerator.js";

import { getVehiclePrice } from "../queries/vehicleQueries.js";
import { getVehicleSuggestions } from "../queries/vehicleQueries.js";
import { findInventory } from "../queries/inventoryQueries.js";
import { findCarProblem } from "../queries/problemQueries.js";

import contextManager from "./contextManager.js";

export const semanticAI = async (userId, message) => {
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

  switch (intentData.intent) {
    case "PRICE_QUERY": {
      if (!mergedEntities.model) {
        return {
          message: "🚗 Bạn muốn xem giá xe nào?",
        };
      }

      const vehicle = await getVehiclePrice(
        mergedEntities.model.name
      );

      if (!vehicle) {
        return {
          message: "❌ Không tìm thấy xe",
        };
      }

      return {
        intent: intentData.intent,
        confidence: intentData.confidence,
        entities: mergedEntities,
        data: vehicle,
        message: generateResponse({
          intent: intentData.intent,
          data: vehicle,
        }),
      };
    }

    case "VEHICLE_SUGGESTION": {
      const vehicles = await getVehicleSuggestions(
        mergedEntities
      );

      const best = vehicles[0];

      return {
        intent: intentData.intent,
        confidence: intentData.confidence,
        entities: mergedEntities,
        data: best,
        message: generateResponse({
          intent: intentData.intent,
          data: best,
        }),
      };
    }

    default: {
      return {
        intent: intentData.intent,
        confidence: intentData.confidence,
        entities: mergedEntities,
        message: "❌ Xin lỗi, tôi không hiểu ý bạn.",
      };
    }
  }
};

export default semanticAI;