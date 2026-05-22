import { getVehicles } from "../services/getVehicles.js";
import { scoreVehicle } from "../ai/semanticEngine.js";
import { mapColors } from "../ai/colorEngine.js";

import Inventory from "../models/Inventory.js";
import CarProblem from "../models/CarProblem.js";

import {
  buildVehicleResponse,
  buildCompareResponse,
  buildTechnicalResponse,
} from "../ai/responseBuilder.js";

import { salesAdvisor } from "../ai/salesAdvisor.js";

const norm = (t = "") =>
  t.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export const agentCore = async (userId, message) => {
  const [models, inventories, problems] = await Promise.all([
    getVehicles(),
    Inventory.find().lean(),
    CarProblem.find().lean(),
  ]);

  const msg = norm(message);

  // ================= RANK =================
  const ranked = models
    .map((v) => ({
      ...v,
      score: scoreVehicle(message, v),
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  // ================= COLOR =================
  if (msg.includes("màu") || msg.includes("mau")) {
    return {
      type: "VEHICLE_COLOR",
      reply: {
        name: best.name,
        exteriorColors: mapColors(best),
      },
    };
  }

  // ================= TECHNICAL =================
  const problem = problems.find(
    (p) =>
      msg.includes(norm(p.title)) ||
      p.symptoms.some((s) => msg.includes(norm(s)))
  );

  if (problem) {
    return {
      type: "TECHNICAL",
      reply: buildTechnicalResponse(problem),
    };
  }

  // ================= COMPARE =================
  if (msg.includes("vs")) {
    const [a, b] = ranked;

    return {
      type: "COMPARE",
      reply: buildCompareResponse(
        a,
        b,
        a.bestVariant,
        b.bestVariant
      ),
    };
  }

  // ================= DETAIL =================
  if (best && best.score > 5) {
    return {
      type: "DETAIL",
      reply: buildVehicleResponse(best, best.bestVariant),
    };
  }

  // ================= RECOMMEND =================
  if (
    msg.includes("gia đình") ||
    msg.includes("7 chỗ") ||
    msg.includes("offroad")
  ) {
    return {
      type: "RECOMMEND",
      reply: ranked.slice(0, 5).map((v) => ({
        name: v.name,
        type: v.type,
        seats: v.seats,
      })),
    };
  }

  // ================= DEFAULT =================
  return {
    type: "GENERAL",
    reply: salesAdvisor({}),
  };
};