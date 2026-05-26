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

  // =========================
  // DETECT INTENT
  // =========================

  const intentData =
    detectIntent(message);

  // =========================
  // EXTRACT ENTITIES
  // =========================

  const entities =
    await extractEntities(message);

  // =========================
  // CONTEXT
  // =========================

  const oldContext =
    contextManager.getContext(
      userId
    );

  const mergedEntities = {
    ...(oldContext?.entities || {}),
    ...entities,
  };

  contextManager.saveContext(
    userId,
    {
      entities: mergedEntities,
      intent: intentData.intent,
    }
  );

  // =========================
  // ROUTER
  // =========================

  switch (intentData.intent) {

    // =========================
    // PRICE QUERY
    // =========================

    case "PRICE_QUERY": {

      if (
        !mergedEntities.model
      ) {

        return {
          intent:
            intentData.intent,

          confidence:
            intentData.confidence,

          entities:
            mergedEntities,

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
          intent:
            intentData.intent,

          confidence:
            intentData.confidence,

          entities:
            mergedEntities,

          message:
            "❌ Không tìm thấy xe",
        };
      }

      return {
        intent:
          intentData.intent,

        confidence:
          intentData.confidence,

        entities:
          mergedEntities,

        data: vehicle,

        message:
          generateResponse({
            intent:
              intentData.intent,

            data: vehicle,
          }),
      };
    }

    // =========================
    // VEHICLE SUGGESTION
    // =========================

    case "VEHICLE_SUGGESTION": {

      const vehicles =
        await getVehicleSuggestions(
          mergedEntities,
          message
        );

      if (
        !vehicles ||
        !vehicles.length
      ) {

        return {
          intent:
            intentData.intent,

          confidence:
            intentData.confidence,

          entities:
            mergedEntities,

          message:
            "❌ Không tìm thấy xe phù hợp.",
        };
      }

      return {
        intent:
          intentData.intent,

        confidence:
          intentData.confidence,

        entities:
          mergedEntities,

        data: vehicles,

        message:
          generateResponse({
            intent:
              intentData.intent,

            data: vehicles,
          }),
      };
    }

    // =========================
    // COMPARE
    // =========================

    case "COMPARE": {

      const compare =
        await compareVehiclesService(
          mergedEntities,
          message
        );

      if (!compare) {

        return {
          intent:
            intentData.intent,

          confidence:
            intentData.confidence,

          entities:
            mergedEntities,

          message:
            "⚠️ Vui lòng nhập 2 mẫu xe cần so sánh.",
        };
      }

      return {
        intent:
          intentData.intent,

        confidence:
          intentData.confidence,

        entities:
          mergedEntities,

        data: compare,

        message:
          generateResponse({
            intent:
              intentData.intent,

            data: compare,
          }),
      };
    }

    // =========================
    // INVENTORY
    // =========================

    case "INVENTORY_CHECK": {

      const inventory =
        await findInventory(
          mergedEntities
        );

      return {
        intent:
          intentData.intent,

        confidence:
          intentData.confidence,

        entities:
          mergedEntities,

        data: inventory,

        message:
          generateResponse({
            intent:
              intentData.intent,

            data: inventory,
          }),
      };
    }

    // =========================
    // VEHICLE SPEC
    // =========================

    case "VEHICLE_SPEC": {

      const specs =
        await getVehicleSpecs(
          mergedEntities
        );

      if (!specs) {

        return {
          intent:
            intentData.intent,

          confidence:
            intentData.confidence,

          entities:
            mergedEntities,

          message:
            "❌ Không tìm thấy thông số xe.",
        };
      }

      return {
        intent:
          intentData.intent,

        confidence:
          intentData.confidence,

        entities:
          mergedEntities,

        data: specs,

        message:
          generateResponse({
            intent:
              intentData.intent,

            data: specs,
          }),
      };
    }

    // =========================
    // TECH SUPPORT
    // =========================

    case "TECH_SUPPORT": {

      const problem =
        await findCarProblem(
          message
        );

      if (!problem) {

        return {
          intent:
            intentData.intent,

          confidence:
            intentData.confidence,

          entities:
            mergedEntities,

          message:
            "⚠️ Tôi chưa xác định được lỗi xe.",
        };
      }

      return {
        intent:
          intentData.intent,

        confidence:
          intentData.confidence,

        entities:
          mergedEntities,

        data: problem,

        message:
          generateResponse({
            intent:
              intentData.intent,

            data: problem,
          }),
      };
    }

    // =========================
    // GREETING / FAQ
    // =========================

    case "GREETING": {

      const faq =
        faqService(message);

      if (faq) {

        return {
          intent: "FAQ",

          confidence:
            intentData.confidence,

          entities:
            mergedEntities,

          message: faq,
        };
      }

      return {
        intent:
          intentData.intent,

        confidence:
          intentData.confidence,

        entities:
          mergedEntities,

        message:
          "👋 Xin chào! Tôi là Ford AI Assistant.",
      };
    }

    // =========================
    // DEFAULT
    // =========================

    default: {

      return {
        intent:
          intentData.intent,

        confidence:
          intentData.confidence,

        entities:
          mergedEntities,

        message:
          "🤖 Xin lỗi, tôi chưa hiểu yêu cầu của bạn.",
      };
    }
  }
};

export default semanticAI;