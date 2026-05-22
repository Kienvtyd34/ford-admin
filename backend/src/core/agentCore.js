import { getVehicleRAG } from "../services/vehicleRag.service.js";
import CarProblem from "../models/CarProblem.js";

import { detectIntent } from "../ai/intentEngine.js";
import { extractEntities } from "../ai/entityEngine.js";

import { rankVehicles } from "../ai/vehicleRanker.js";
import { buildVehicleResponse, buildTechnicalResponse } from "../ai/responseBuilder.js";

export const agentCore = async (userId, message) => {
  const [vehicles, problems] = await Promise.all([
    getVehicleRAG(),
    CarProblem.find().lean(),
  ]);

  const intent = detectIntent(message);
  const entities = extractEntities(message, vehicles);

  // TECH
  if (intent === "TECHNICAL") {
    const match = problems.find((p) =>
      message.toLowerCase().includes(p.title.toLowerCase())
    );

    if (match) return { type: "TECH", reply: buildTechnicalResponse(match) };

    return { type: "TECH", reply: "⚠️ Mô tả rõ hơn giúp mình nhé" };
  }

  // RANK VEHICLE
  const ranked = rankVehicles(message, vehicles);

  if (ranked.length) {
    return {
      type: "VEHICLE",
      reply: ranked.map((v) =>
        buildVehicleResponse(v, v.bestVariant)
      ),
    };
  }

  return {
    type: "GENERAL",
    reply: "Bạn muốn xe 7 chỗ, SUV hay offroad?",
  };
};