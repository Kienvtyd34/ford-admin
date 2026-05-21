import VehicleModel from "../models/VehicleModel.js";
import VehicleVariant from "../models/Variant.js";
import Inventory from "../models/Inventory.js";
import CarProblem from "../models/CarProblem.js";

import { detectIntent } from "../ai/intentEngine.js";
import { extractEntities } from "../ai/entityExtractor.js";
import { recommendVehicles } from "../ai/recommendationEngine.js";

import {
  buildVehicleResponse,
  buildCompareResponse,
  buildInventoryResponse,
  buildTechnicalResponse,
} from "../ai/responseBuilder.js";

import { saveMemory } from "../ai/memoryEngine.js";
import { salesAdvisor } from "../ai/salesAdvisor.js";

// ================= NORMALIZE =================

const normalize = (text = "") => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// ================= AGENT CORE =================

export const agentCore = async (
  userId,
  message
) => {
  const [
    models,
    variants,
    inventories,
    problems,
  ] = await Promise.all([
    VehicleModel.find(),
    VehicleVariant.find(),
    Inventory.find(),
    CarProblem.find(),
  ]);

  const normalizedMessage =
    normalize(message);

  const intent =
    detectIntent(message);

  const entities =
    extractEntities(
      message,
      models,
      variants
    );

  saveMemory(userId, entities);

  // ================= COMPARE =================

  if (
    intent === "COMPARE" &&
    entities.models.length >= 2
  ) {
    const car1 =
      entities.models[0];

    const car2 =
      entities.models[1];

    const variant1 =
      variants.find(
        (v) =>
          String(v.modelId) ===
          String(car1._id)
      );

    const variant2 =
      variants.find(
        (v) =>
          String(v.modelId) ===
          String(car2._id)
      );

    return buildCompareResponse(
      car1,
      car2,
      variant1,
      variant2
    );
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
      return "Không tìm thấy xe phù hợp";
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
          "\n" +
          salesAdvisor(entities)
        );
      })
      .join("\n\n");
  }

  // ================= MODEL =================

  if (
    entities.models.length
  ) {
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
`;
  }

  // ================= INVENTORY =================

  if (
    intent === "TEST_DRIVE"
  ) {
    const available =
      inventories.filter(
        (i) => i.testDriveAvailable
      );

    if (!available.length) {
      return "Hiện chưa có xe lái thử";
    }

    return buildInventoryResponse(
      available
    );
  }

  // ================= TECHNICAL =================

  if (
    intent === "TECHNICAL"
  ) {
    let found = null;

    for (const p of problems) {
      // title
      if (
        normalizedMessage.includes(
          normalize(p.title)
        )
      ) {
        found = p;
        break;
      }

      // symptoms
      const symptomMatched =
        p.symptoms.some((s) =>
          normalizedMessage.includes(
            normalize(s)
          )
        );

      if (symptomMatched) {
        found = p;
        break;
      }

      // causes
      const causeMatched =
        p.causes.some((c) =>
          normalizedMessage.includes(
            normalize(c)
          )
        );

      if (causeMatched) {
        found = p;
        break;
      }
    }

    if (found) {
      return buildTechnicalResponse(
        found
      );
    }

    return `
⚠️ Tôi chưa nhận diện được lỗi.

Ví dụ:
- xe rung khi sang số
- điều hòa không mát
- đèn ABS sáng
- lỗi U3000
`;
  }

  // ================= DEFAULT =================

  return `
Tôi có thể hỗ trợ:

• Giá xe
• Phiên bản xe
• SUV / bán tải
• Xe gia đình
• Xe offroad
• Xe tiết kiệm nhiên liệu
• Xe đang lái thử
• So sánh xe
• Lỗi kỹ thuật
• Triệu chứng xe

Ví dụ:
- Everest vs Ranger
- SUV 7 chỗ
- xe offroad
- xe bị lỗi ABS
`;
};