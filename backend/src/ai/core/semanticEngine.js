import detectIntent from "./intentDetector.js";
import extractEntities from "./entityExtractor.js";
import generateResponse from "./responseGenerator.js";

import { responseWrapper } from "./responseWrapper.js";

import {
  getVehiclePrice,
  getVehicleSuggestions,
  compareVehiclesService,
  getVehicleSpecs,
  getFeatureInfo,
  compareVariants,
} from "../queries/vehicleQueries.js";

import { findInventory } from "../queries/inventoryQueries.js";
import { findCarProblem } from "../queries/problemQueries.js";
import { faqService } from "../services/faqService.js";
import contextManager from "./contextManager.js";

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

    switch (intentData.intent) {

      // ================= PRICE =================
      case "PRICE_QUERY": {
        if (!mergedEntities.model) {
          return responseWrapper({
            success: true,
            intent: "PRICE_QUERY",
            confidence: intentData.confidence,
            entities: mergedEntities,
            message: "🚗 Bạn muốn xem giá xe nào?",
          });
        }

        const vehicle = await getVehiclePrice(
          mergedEntities.model.name,
          mergedEntities.variant
        );

        if (!vehicle) {
          return responseWrapper({
            success: false,
            intent: "PRICE_QUERY",
            confidence: intentData.confidence,
            entities: mergedEntities,
            message: "❌ Không tìm thấy xe.",
          });
        }

        return responseWrapper({
          success: true,
          intent: "PRICE_QUERY",
          confidence: intentData.confidence,
          entities: mergedEntities,
          data: vehicle,
          message: generateResponse({
            intent: "PRICE_QUERY",
            data: vehicle,
          }),
        });
      }

      // ================= SUGGEST =================
      case "VEHICLE_SUGGESTION": {
        const vehicles = await getVehicleSuggestions(mergedEntities);

        return responseWrapper({
          success: true,
          intent: "VEHICLE_SUGGESTION",
          confidence: intentData.confidence,
          entities: mergedEntities,
          data: vehicles,
          message: generateResponse({
            intent: "VEHICLE_SUGGESTION",
            data: vehicles,
          }),
        });
      }

      // ================= FEATURE =================
      case "FEATURE_QUERY": {
        const featureData = await getFeatureInfo(mergedEntities);

        if (!featureData) {
          return responseWrapper({
            success: false,
            intent: "FEATURE_QUERY",
            confidence: intentData.confidence,
            entities: mergedEntities,
            message: "❌ Không tìm thấy tính năng.",
          });
        }

        return responseWrapper({
          success: true,
          intent: "FEATURE_QUERY",
          confidence: intentData.confidence,
          entities: mergedEntities,
          data: featureData,
          message: generateResponse({
            intent: "FEATURE_QUERY",
            data: featureData,
          }),
        });
      }

      // ================= COMPARE =================
      case "COMPARE": {
        if (mergedEntities.compareVariants?.length >= 2) {
          const result = await compareVariants(mergedEntities);

          return responseWrapper({
            success: true,
            intent: "VARIANT_COMPARE",
            confidence: intentData.confidence,
            entities: mergedEntities,
            data: result,
            message: generateResponse({
              intent: "VARIANT_COMPARE",
              data: result,
            }),
          });
        }

        const result = await compareVehiclesService(mergedEntities);

        return responseWrapper({
          success: true,
          intent: "COMPARE",
          confidence: intentData.confidence,
          entities: mergedEntities,
          data: result,
          message: generateResponse({
            intent: "COMPARE",
            data: result,
          }),
        });
      }

      // ================= INVENTORY =================
      case "INVENTORY_CHECK": {
        const inventory = await findInventory(mergedEntities);

        return responseWrapper({
          success: true,
          intent: "INVENTORY_CHECK",
          confidence: intentData.confidence,
          entities: mergedEntities,
          data: inventory,
          message: generateResponse({
            intent: "INVENTORY_CHECK",
            data: inventory,
          }),
        });
      }

      // ================= TECH =================
      case "TECH_SUPPORT": {
        const problem = await findCarProblem(message);

        return responseWrapper({
          success: !!problem,
          intent: "TECH_SUPPORT",
          confidence: intentData.confidence,
          entities: mergedEntities,
          data: problem,
          message: generateResponse({
            intent: "TECH_SUPPORT",
            data: problem,
          }),
        });
      }

      // ================= GREETING =================
      case "GREETING": {
        const faq = faqService(message);

        return responseWrapper({
          success: true,
          intent: "GREETING",
          confidence: intentData.confidence,
          entities: mergedEntities,
          message: faq || "👋 Xin chào! Tôi là Ford AI Assistant.",
        });
      }

      // ================= DEFAULT =================
      default:
        return responseWrapper({
          success: false,
          intent: "UNKNOWN",
          confidence: 0,
          entities: mergedEntities,
          message: "🤖 Tôi chưa hiểu yêu cầu.",
        });
    }

  } catch (error) {
    return responseWrapper({
      success: false,
      intent: "ERROR",
      confidence: 0,
      message: "⚠️ Hệ thống lỗi, vui lòng thử lại.",
      error: error.message,
    });
  }
};

export default semanticAI;