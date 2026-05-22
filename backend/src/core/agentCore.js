import { getVehicles } from "./getVehicles.js";
import { bestConceptMatch } from "../ai/semanticEngine.js";
import { mapColors } from "../ai/colorEngine.js";
import { recommendVehicles } from "../ai/recommendationEngine.js";

import Inventory from "../models/Inventory.js";
import CarProblem from "../models/CarProblem.js";

import {
  buildVehicleResponse,
  buildCompareResponse,
  buildTechnicalResponse,
} from "../ai/responseBuilder.js";

import { salesAdvisor } from "../ai/salesAdvisor.js";

const normalize = (text = "") =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const agentCore = async (userId, message) => {
  const [models, inventories, problems] = await Promise.all([
    getVehicles(),
    Inventory.find().lean(),
    CarProblem.find().lean(),
  ]);

  const msg = normalize(message);

  const intent = bestConceptMatch(message);
  const entities = { models };

  // ================= COLOR =================
  if (msg.includes("mau") || msg.includes("mau sac")) {
    const car = models[0];

    return {
      type: "VEHICLE_COLOR",
      reply: {
        name: car.name,
        exteriorColors: mapColors(car),
      },
    };
  }

  // ================= TECHNICAL =================
  if (intent.key === "offroad" && msg.includes("loi")) {
    const found = problems.find((p) =>
      msg.includes(normalize(p.title))
    );

    if (found) {
      return {
        type: "TECHNICAL",
        reply: buildTechnicalResponse(found),
      };
    }
  }

  // ================= COMPARE =================
  if (msg.includes("vs")) {
    const [car1, car2] = models;

    return {
      type: "COMPARE",
      reply: buildCompareResponse(
        car1,
        car2,
        car1.bestVariant,
        car2.bestVariant
      ),
    };
  }

  // ================= DETAIL =================
  if (models.length === 1) {
    return {
      type: "DETAIL",
      reply: buildVehicleResponse(models[0], models[0].bestVariant),
    };
  }

  // ================= RECOMMEND =================
  if (intent.key) {
    const recs = recommendVehicles({
      message,
      models,
    });

    return {
      type: "RECOMMEND",
      reply: recs.map((r) => ({
        name: r.name,
        type: r.type,
        seats: r.seats,
        score: r.score,
        colors: mapColors(r),
      })),
    };
  }

  // ================= DEFAULT =================
  return {
    type: "GENERAL",
    reply: salesAdvisor({}),
  };
};