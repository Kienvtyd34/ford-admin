import VehicleModel from "../models/VehicleModel.js";
import VehicleVariant from "../models/VehicleVariant.js";
import Inventory from "../models/Inventory.js";
import TechnicalIssue from "../models/TechnicalIssue.js";

import { detectIntent } from "../ai/intentEngine.js";
import { extractEntities } from "../ai/entityExtractor.js";
import { recommendVehicles } from "../ai/recommendationEngine.js";
import { buildVehicleResponse } from "../ai/responseBuilder.js";
import { saveMemory } from "../ai/memoryEngine.js";
import { salesAdvisor } from "../ai/salesAdvisor.js";

export const agentCore = async (
  userId,
  message
) => {
  const [
    models,
    variants,
    inventories,
    issues,
  ] = await Promise.all([
    VehicleModel.find(),
    VehicleVariant.find(),
    Inventory.find(),
    TechnicalIssue.find(),
  ]);

  const intent =
    detectIntent(message);

  const entities =
    extractEntities(
      message,
      models,
      variants
    );

  saveMemory(userId, entities);

  // recommendation
  if (
    intent === "RECOMMEND"
  ) {
    const recs =
      recommendVehicles({
        entities,
        models,
        variants,
      });

    return recs
      .map((car) => {
        const variant =
          variants.find(
            (v) =>
              String(v.modelId) ===
              String(car._id)
          );

        return (
          buildVehicleResponse(
            car,
            variant
          ) +
          salesAdvisor(entities)
        );
      })
      .join("\n");
  }

  // model
  if (entities.models.length) {
    const car =
      entities.models[0];

    const variant =
      variants.find(
        (v) =>
          String(v.modelId) ===
          String(car._id)
      );

    return buildVehicleResponse(
      car,
      variant
    );
  }

  // variant
  if (
    entities.variants.length
  ) {
    const v =
      entities.variants[0];

    return `
🚘 ${v.variantName}

💰 ${v.basePrice.toLocaleString(
      "vi-VN"
    )} VNĐ
`;
  }

  // technical
  if (
    intent === "TECHNICAL"
  ) {
    const found = issues.find(
      (i) =>
        message
          .toLowerCase()
          .includes(
            i.title.toLowerCase()
          )
    );

    if (found) {
      return `
⚠️ ${found.title}

🔍 Triệu chứng:
${found.symptoms.join(", ")}

🛠️ Giải pháp:
${found.solutions.join(", ")}
`;
    }
  }

  return `
Tôi có thể hỗ trợ:
- giá xe
- phiên bản
- SUV 7 chỗ
- xe gia đình
- xe offroad
- lỗi kỹ thuật
- xe lái thử
`;
};