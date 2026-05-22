import { getVehicleRAG } from "../services/vehicleRag.service.js";
import CarProblem from "../models/CarProblem.js";

import { extractEntities } from "../ai/entityEngine.js";
import { detectIntent } from "../ai/intentEngine.js";

import { rankVehicles } from "../ai/vehicleRanker.js";
import { getBestVariant } from "../utils/getBestVariant.js";

import { buildVehicleResponse } from "../ai/responseBuilder.js";

export const agentCore = async (userId, message) => {
  const [vehicles, problems] = await Promise.all([
    getVehicleRAG(),
    CarProblem.find().lean(),
  ]);

  const intent = detectIntent(message);
  const entities = extractEntities(message, vehicles);

  // ================= TECH =================
  if (intent === "TECHNICAL") {
    return {
      type: "TECHNICAL",
      reply: "⚠️ Mô tả rõ hơn giúp mình nhé",
    };
  }

  // ================= VEHICLE RANKING =================
  const ranked = rankVehicles(message, vehicles);

  if (ranked.length > 0) {
    return {
      type: "VEHICLE",
      reply: ranked.map((v) =>
        buildVehicleResponse(v, getBestVariant(v))
      ),
    };
  }

  // ================= FALLBACK =================
  return {
    type: "GENERAL",
    reply: "Bạn muốn tìm xe gia đình, offroad hay 7 chỗ?",
  };
};