import { getVehicleRAG } from "../services/vehicleRag.service.js";
import CarProblem from "../models/CarProblem.js";

import { detectIntent } from "../ai/intentEngine.js";
import { extractEntities } from "../ai/entityEngine.js";
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

  const intent = detectIntent(message);
  const entities = extractEntities(message, vehicles);

  // =================🔥 1. TECHNICAL (FIX QUAN TRỌNG NHẤT)
  const techMatch = matchIssue(message, problems);

  if (techMatch?.issue) {
    return {
      type: "TECHNICAL",
      reply: buildTechnicalResponse(techMatch.issue),
    };
  }

  // ================= 2. VEHICLE RANKING
  const ranked = rankVehicles(message, vehicles);

  if (ranked.length > 0) {
    return {
      type: "VEHICLE",
      reply: ranked.map((v) =>
        buildVehicleResponse(v, getBestVariant(v))
      ),
    };
  }

  // ================= 3. FALLBACK
  return {
    type: "GENERAL",
    reply: "Bạn muốn xe 7 chỗ, SUV hay offroad?",
  };
};