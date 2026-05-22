import { getVehicleRAG } from "../services/vehicleRag.service.js";
import CarProblem from "../models/CarProblem.js";

import { extractEntities } from "../ai/entityEngine.js";
import { detectIntent } from "../ai/intentEngine.js";

import { matchVehicles } from "../ai/vehicleRag.js";
import { matchIssue } from "../ai/technicalRag.js";

import {
  buildVehicleResponse,
  buildCompareResponse,
  buildTechnicalResponse,
} from "../ai/responseBuilder.js";

export const agentCore = async (userId, message) => {
  const [vehicles, problems] = await Promise.all([
    getVehicleRAG(),
    CarProblem.find().lean(),
  ]);

  const entities = extractEntities(message, vehicles);
  const intent = detectIntent(message, entities);

  // ================= TECHNICAL =================
  if (intent === "TECHNICAL") {
    const match = matchIssue(message, problems);

    if (match) {
      return {
        type: "TECHNICAL",
        reply: buildTechnicalResponse(match),
      };
    }

    return {
      type: "TECHNICAL",
      reply: "Vui lòng mô tả rõ hơn (rung, giật, điều hòa...)",
    };
  }

  // ================= VEHICLE =================
  const matched = matchVehicles(message, vehicles);

  if (matched.length > 0) {
    return {
      type: intent,
      reply: matched.map((v) =>
        buildVehicleResponse(
          v,
          v.bestVariant || v.variants?.[0] || {}
        )
      ),
    };
  }

  return {
    type: "GENERAL",
    reply: "Bạn muốn tìm xe, lỗi kỹ thuật hay so sánh?",
  };
};