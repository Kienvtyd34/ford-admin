import { getVehicleRAG } from "../services/vehicleRag.service.js";
import CarProblem from "../models/CarProblem.js";

import { extractEntities } from "../ai/entityEngine.js";
import { detectIntent } from "../ai/intentEngine.js";

import { rankVehicles } from "../ai/vehicleRanker.js";
import { getBestVariant } from "../utils/getBestVariant.js";

import {
  buildVehicleResponse,
  buildTechnicalResponse,
} from "../ai/responseBuilder.js";

import { matchIssue } from "../ai/technicalRag.js";

export const agentCore = async (userId, message) => {
  const [vehicles, problems] = await Promise.all([
    getVehicleRAG(),
    CarProblem.find().lean(),
  ]);

  const entities = extractEntities(message, vehicles);
  const intent = detectIntent(message, entities);

  // ================= TECH =================
  if (intent === "TECHNICAL") {
    const match = matchIssue(message, problems);

    if (match) {
      return {
        type: "TECHNICAL",
        reply: buildTechnicalResponse(match.issue),
      };
    }

    return {
      type: "TECHNICAL",
      reply: "Hãy mô tả rõ hơn (rung, giật, điều hòa...)",
    };
  }

  // ================= VEHICLE =================
  const ranked = rankVehicles(message, vehicles);

  if (ranked.length > 0) {
    return {
      type: "VEHICLE",
      reply: ranked.map((v) =>
        buildVehicleResponse(v, getBestVariant(v))
      ),
    };
  }

  return {
    type: "GENERAL",
    reply: "Bạn muốn xe gia đình, offroad hay 7 chỗ?",
  };
};