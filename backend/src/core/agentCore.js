// src/core/agentCore.js

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

export const agentCore = async (
  userId,
  message
) => {

  // ================= LOAD DATA =================

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

  // ================= AI =================

  const intent =
    detectIntent(message);

  const entities =
    extractEntities(
      message,
      models,
      variants
    );

  // ================= MEMORY =================

  saveMemory(
    userId,
    entities
  );

  // ================= COMPARE =================

  if (
    intent === "COMPARE"
  ) {

    if (
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

    return `
Hãy nhập dạng:

Everest vs Ranger
`;
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
Không có dữ liệu phù hợp
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
          "\n" +
          salesAdvisor(
            entities
          )
        );
      })
      .join("\n\n");
  }

  // ================= INVENTORY =================

  if (
    intent === "TEST_DRIVE"
  ) {

    const available =
      inventories.filter(
        (i) =>
          i.isTestDrive === true
      );

    if (!available.length) {
      return `
Hiện chưa có xe lái thử
`;
    }

    return available
      .map((i) =>
        buildInventoryResponse(i)
      )
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

💰 Giá:
${v.basePrice.toLocaleString(
  "vi-VN"
)} VNĐ

⚙️ Hộp số:
${v.transmission}

🛞 Dẫn động:
${v.driveTrain}

⛽ Nhiên liệu:
${v.fuelType}
`;
  }

  // ================= TECHNICAL =================

  if (
    intent === "TECHNICAL"
  ) {

    const lower =
      message.toLowerCase();

    const found =
      problems.find((p) => {

        // match title
        if (
          lower.includes(
            p.title.toLowerCase()
          )
        ) {
          return true;
        }

        // match symptoms
        return p.symptoms.some(
          (s) =>
            lower.includes(
              s.toLowerCase()
            )
        );

      });

    if (found) {

      return buildTechnicalResponse(
        found
      );
    }

    return `
Không tìm thấy lỗi kỹ thuật phù hợp
`;
  }

  // ================= FALLBACK =================

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