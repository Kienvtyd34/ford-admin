import { getVehicleGraph } from "../services/getVehicles.js";
import { rankVehicles } from "../ai/semanticEngine.js";
import { getColorsByVariant } from "../ai/colorEngine.js";

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
    getVehicleGraph(),
    Inventory.find().lean(),
    CarProblem.find().lean(),
  ]);

  const msg = norm(message);

  // ================= SMART RANK (FIX BUG CHỌN SAI XE) =================
  const ranked = rankVehicles(message, models);
  const best = ranked[0];

  // ================= COLOR =================
  if (msg.includes("màu") || msg.includes("mau")) {
    if (!best) return { type: "VEHICLE_COLOR", reply: [] };

    const colors = await getColorsByVariant(best.bestVariant?._id);

    return {
      type: "VEHICLE_COLOR",
      reply: {
        name: best.name,
        exteriorColors: colors,
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
  if (best && best.score > 3) {
    return {
      type: "DETAIL",
      reply: buildVehicleResponse(best, best.bestVariant),
    };
  }

  // ================= RECOMMEND =================
  if (
    msg.includes("gia đình") ||
    msg.includes("offroad") ||
    msg.includes("7 chỗ")
  ) {
    return {
      type: "RECOMMEND",
      reply: ranked.slice(0, 5).map((r) => ({
        name: r.name,
        type: r.type,
        seats: r.seats,
        price: r.bestVariant?.basePrice,
      })),
    };
  }

  // ================= DEFAULT =================
  return {
    type: "GENERAL",
    reply: salesAdvisor({}),
  };
};