// core/agentCore.js

import { getVehicleRAG } from "../services/vehicleRag.service.js";
import CarProblem from "../models/CarProblem.js";

import { extractEntities } from "../ai/entityEngine.js";
import { detectIntent } from "../ai/intentEngine.js";

import { matchIssue } from "../ai/technicalRag.js";
import { matchVehicles } from "../ai/vehicleRag.js";

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
        confidence: match.confidence,
        reply: buildTechnicalResponse(match.issue),
      };
    }

    return {
      type: "TECHNICAL",
      reply: "Mô tả rõ hơn giúp mình nhé",
    };
  }

  // ================= VEHICLE =================
  const matched = matchVehicles(message, vehicles);

  if (matched.length) {
    return {
      type: intent,
      reply:
        intent === "COMPARE"
          ? buildCompareResponse(
              matched[0],
              matched[1] || matched[0],
              matched[0].bestVariant,
              matched[1]?.bestVariant
            )
          : matched.map((v) =>
              buildVehicleResponse(v, v.bestVariant)
            ),
    };
  }

  return {
    type: "GENERAL",
    reply: "Bạn muốn tìm xe, lỗi hay so sánh?",
  };
};