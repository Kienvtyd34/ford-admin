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
  try {
    const [vehicles, problems] = await Promise.all([
      getVehicleRAG(),
      CarProblem.find().lean(),
    ]);

    const techMatch = matchIssue(message, problems);

    if (techMatch?.issue) {
      return {
        type: "TECHNICAL",
        reply: buildTechnicalResponse(techMatch.issue),
      };
    }

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
      reply: "Bạn muốn xe 7 chỗ, SUV hay offroad?",
    };

  } catch (err) {
    console.error(err);
    return {
      type: "ERROR",
      reply: "Server lỗi, vui lòng thử lại",
    };
  }
};