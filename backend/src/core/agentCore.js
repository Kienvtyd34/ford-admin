import VehicleModel from "../models/VehicleModel.js";
import VehicleVariant from "../models/Variant.js";
import Inventory from "../models/Inventory.js";
import TechnicalIssue from "../models/TechnicalIssue.js";

import { detectIntent }
from "../ai/intentEngine.js";

import { extractEntities }
from "../ai/entityExtractor.js";

import { recommendVehicles }
from "../ai/recommendationEngine.js";

import {
  buildVehicleResponse,
  buildCompareResponse,
  buildTechnicalResponse,
  buildInventoryResponse,
}
from "../ai/responseBuilder.js";

import { saveMemory }
from "../ai/memoryEngine.js";

import { salesAdvisor }
from "../ai/salesAdvisor.js";

import {
  semanticVehicleSearch,
  semanticTechnicalSearch,
}
from "../ai/semanticSearch.js";

export const agentCore = async (
  userId,
  message
) => {

  // ================= LOAD DATABASE =================

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

  // ================= NLP =================

  const intent =
    detectIntent(message);

  const entities =
    extractEntities(
      message,
      models,
      variants
    );

  // ================= MEMORY =================

  await saveMemory(
    userId,
    {
      message,
      intent,
      entities,
      time: new Date(),
    }
  );

  // ================= COMPARE =================

  if (
    intent === "COMPARE"
  ) {

    const compareCars =
      semanticVehicleSearch(
        message,
        models
      );

    if (
      compareCars.length >= 2
    ) {

      return buildCompareResponse(
        compareCars[0],
        compareCars[1],
        variants
      );
    }
  }

  // ================= RECOMMEND =================

  if (
    intent === "RECOMMEND"
  ) {

    const recs =
      recommendVehicles({
        entities,
        models,
        variants,
      });

    if (!recs.length) {
      return `
Không tìm thấy xe phù hợp.
`;
    }

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
          salesAdvisor(
            car,
            entities
          )
        );
      })
      .join("\n\n");
  }

  // ================= INVENTORY =================

  if (
    intent === "INVENTORY"
  ) {

    const demoCars =
      inventories.filter(
        (i) =>
          i.status ===
          "Đang lái thử"
      );

    if (!demoCars.length) {
      return `
Hiện chưa có xe lái thử
`;
    }

    return buildInventoryResponse(
      demoCars,
      variants,
      models
    );
  }

  // ================= TECHNICAL =================

  if (
    intent === "TECHNICAL"
  ) {

    const found =
      semanticTechnicalSearch(
        message,
        issues
      );

    if (found) {
      return buildTechnicalResponse(
        found
      );
    }

    return `
Không tìm thấy lỗi kỹ thuật phù hợp
`;
  }

  // ================= VARIANT =================

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

⚙️ ${v.transmission}

🛞 ${v.driveTrain}

⛽ ${v.fuelType}
`;
  }

  // ================= VEHICLE =================

  const foundCars =
    semanticVehicleSearch(
      message,
      models
    );

  if (
    foundCars.length
  ) {

    return foundCars
      .map((car) => {

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
      })
      .join("\n\n");
  }

  // ================= FALLBACK =================

  return `
Tôi có thể hỗ trợ:

🚗 Giá xe
🚗 Phiên bản
🚗 SUV 7 chỗ
🚗 Xe gia đình
🚗 Xe tiết kiệm nhiên liệu
🚗 Xe offroad
🚗 Xe lái thử
🚗 So sánh xe
🚗 Lỗi kỹ thuật
🚗 Triệu chứng xe
`;
};