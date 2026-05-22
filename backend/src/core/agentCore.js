import { getVehicles } from "../services/getVehicles.js";
import Inventory from "../models/Inventory.js";
import CarProblem from "../models/CarProblem.js";

import { detectIntent } from "../ai/intentEngine.js";
import { extractEntities } from "../ai/entityExtractor.js";

import { recommendVehicles } from "../ai/recommendationEngine.js";
import { mapColors } from "../ai/colorEngine.js";

import {
  buildVehicleResponse,
  buildCompareResponse,
  buildTechnicalResponse,
} from "../ai/responseBuilder.js";

import { salesAdvisor } from "../ai/salesAdvisor.js";

const normalize = (t = "") =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// ================= STRICT PRIORITY ENGINE =================
export const agentCore = async (userId, message) => {
  const [models, inventories, problems] = await Promise.all([
    getVehicles(),
    Inventory.find().lean(),
    CarProblem.find().lean(),
  ]);

  const msg = normalize(message);
  const intent = detectIntent(message);
  const entities = extractEntities(message, models);

  const findCar = () =>
    entities?.models?.[0] ||
    models.find((m) => msg.includes(normalize(m.name))) ||
    null;

  // ================= 1. TECHNICAL (HIGHEST PRIORITY) =================
  const technicalMatch =
    problems.find(
      (p) =>
        msg.includes(normalize(p.title)) ||
        p.symptoms?.some((s) => msg.includes(normalize(s)))
    );

  if (technicalMatch) {
    return {
      type: "TECHNICAL",
      reply: buildTechnicalResponse(technicalMatch),
    };
  }

  if (intent === "TECHNICAL") {
    return {
      type: "TECHNICAL",
      reply:
        "⚠️ Bạn mô tả rõ hơn (rung, giật, điều hòa không mát, ABS, máy yếu...)",
    };
  }

  // ================= 2. COLOR =================
  if (intent === "COLOR") {
    const car = findCar() || models[0];

    return {
      type: "VEHICLE_COLOR",
      reply: {
        name: car.name,
        exteriorColors: mapColors(car),
      },
    };
  }

  // ================= 3. FAMILY 7 SEATS =================
  if (intent === "FAMILY") {
    const cars = models.filter((m) => m.seats >= 7);

    const best =
      cars.find((c) => c.name.toLowerCase().includes("everest")) ||
      cars[0];

    return {
      type: "DETAIL",
      reply: buildVehicleResponse(best, best.bestVariant),
    };
  }

  // ================= 4. OFFROAD =================
  if (intent === "OFFROAD") {
    const cars = models.filter(
      (m) =>
        m.type === "Pick-up" ||
        m.name.toLowerCase().includes("raptor") ||
        m.name.toLowerCase().includes("ranger")
    );

    const best =
      cars.find((c) => c.name.toLowerCase().includes("raptor")) ||
      cars[0];

    return {
      type: "DETAIL",
      reply: buildVehicleResponse(best, best.bestVariant),
    };
  }

  // ================= 5. COMPARE =================
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

  // ================= 6. SINGLE CAR DETAIL =================
  if (entities.models.length === 1) {
    const car = entities.models[0];

    return {
      type: "DETAIL",
      reply: buildVehicleResponse(car, car.bestVariant),
    };
  }

  // ================= 7. RECOMMEND (ONLY IF NOTHING ELSE MATCH) =================
  const recs = recommendVehicles({ entities, models });

  if (recs.length) {
    return {
      type: "RECOMMEND",
      reply: recs.slice(0, 5).map((r) => ({
        name: r.name,
        type: r.type,
        seats: r.seats,
        price: r.bestVariant?.basePrice,
        colors: mapColors(r),
      })),
    };
  }

  // ================= FINAL =================
  return {
    type: "GENERAL",
    reply: salesAdvisor(entities),
  };
};