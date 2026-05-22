import { getVehicles } from "../services/getVehicles.js";
import Inventory from "../models/Inventory.js";
import CarProblem from "../models/CarProblem.js";

import { recommendVehicles } from "../ai/recommendationEngine.js";
import { mapColors } from "../ai/colorEngine.js";

import {
  buildVehicleResponse,
  buildCompareResponse,
  buildTechnicalResponse,
} from "../ai/responseBuilder.js";

import { salesAdvisor } from "../ai/salesAdvisor.js";

// ================= NORMALIZE =================
const normalize = (t = "") =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// ================= INTENT ENGINE (FINAL SIMPLE BUT STRONG) =================
const detectIntent = (msg) => {
  const m = normalize(msg);

  // COLOR
  if (m.includes("mau")) return "COLOR";

  // FAMILY
  if (m.includes("7 cho") || m.includes("gia dinh")) return "FAMILY";

  // OFFROAD
  if (m.includes("offroad") || m.includes("dia hinh")) return "OFFROAD";

  // TECHNICAL
  if (
    m.includes("loi") ||
    m.includes("rung") ||
    m.includes("giat") ||
    m.includes("khong lanh") ||
    m.includes("dieu hoa")
  )
    return "TECHNICAL";

  // COMPARE
  if (m.includes(" vs ") || m.includes("so sanh")) return "COMPARE";

  return "GENERAL";
};

// ================= CORE =================
export const agentCore = async (userId, message) => {
  const [models, inventories, problems] = await Promise.all([
    getVehicles(),
    Inventory.find().lean(),
    CarProblem.find().lean(),
  ]);

  const intent = detectIntent(message);
  const msg = normalize(message);

  // ================= COLOR =================
  if (intent === "COLOR") {
    const car =
      models.find((m) => msg.includes(normalize(m.name))) || models[0];

    return {
      type: "VEHICLE_COLOR",
      reply: {
        name: car.name,
        exteriorColors: mapColors(car),
      },
    };
  }

  // ================= TECHNICAL =================
  if (intent === "TECHNICAL") {
    const found = problems.find(
      (p) =>
        msg.includes(normalize(p.title)) ||
        p.symptoms.some((s) => msg.includes(normalize(s)))
    );

    if (found) {
      return {
        type: "TECHNICAL",
        reply: buildTechnicalResponse(found),
      };
    }

    return {
      type: "TECHNICAL",
      reply:
        "⚠️ Tôi chưa xác định được lỗi. Bạn mô tả rõ hơn (ví dụ: rung, điều hòa không mát, đèn báo...).",
    };
  }

  // ================= FAMILY (FIX CHÍNH) =================
  if (intent === "FAMILY") {
    const cars = models
      .filter((m) => m.seats >= 7)
      .sort((a, b) => b.seats - a.seats);

    const best = cars[0];

    if (!best) {
      return {
        type: "GENERAL",
        reply: "Không tìm thấy xe phù hợp.",
      };
    }

    return {
      type: "DETAIL",
      reply: buildVehicleResponse(best, best.bestVariant),
    };
  }

  // ================= OFFROAD (FIX CHÍNH) =================
  if (intent === "OFFROAD") {
    const cars = models.filter(
      (m) =>
        m.type === "Pick-up" ||
        m.name.toLowerCase().includes("raptor") ||
        m.name.toLowerCase().includes("ranger")
    );

    const best = cars[0];

    return {
      type: "DETAIL",
      reply: buildVehicleResponse(best, best.bestVariant),
    };
  }

  // ================= COMPARE =================
  if (intent === "COMPARE") {
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

  // ================= SINGLE DETAIL =================
  if (models.length === 1) {
    return {
      type: "DETAIL",
      reply: buildVehicleResponse(models[0], models[0].bestVariant),
    };
  }

  // ================= SMART RECOMMEND =================
  const recs = recommendVehicles({ models });

  if (recs.length) {
    return {
      type: "RECOMMEND",
      reply: recs.slice(0, 5).map((r) => ({
        name: r.name,
        type: r.type,
        seats: r.seats,
      })),
    };
  }

  // ================= FINAL FALLBACK =================
  return {
    type: "GENERAL",
    reply: salesAdvisor({}),
  };
};