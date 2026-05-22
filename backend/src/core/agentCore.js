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

// ================= NORMALIZE =================
const normalize = (t = "") =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// ================= CORE =================
export const agentCore = async (userId, message) => {
  const [models, inventories, problems] = await Promise.all([
    getVehicles(),
    Inventory.find().lean(),
    CarProblem.find().lean(),
  ]);

  const msg = normalize(message);
  const intent = detectIntent(message);
  const entities = extractEntities(message, models);

  // ================= FIND CAR HELPERS =================
  const findCar = () => {
    if (entities?.models?.length) return entities.models[0];

    return (
      models.find((m) => msg.includes(normalize(m.name))) ||
      models[0]
    );
  };

  // ================= COLOR =================
  if (intent === "COLOR") {
    const car = findCar();

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
        p.symptoms?.some((s) => msg.includes(normalize(s)))
    );

    if (!found) {
      return {
        type: "TECHNICAL",
        reply:
          "⚠️ Bạn mô tả rõ hơn giúp mình (rung, giật, điều hòa, ABS, máy yếu...)",
      };
    }

    return {
      type: "TECHNICAL",
      reply: buildTechnicalResponse(found),
    };
  }

  // ================= FAMILY 7 SEATS =================
  if (intent === "FAMILY") {
    const cars = models.filter((m) => m.seats >= 7);

    const best =
      cars.find((c) => c.name.toLowerCase().includes("everest")) ||
      cars[0];

    if (!best) {
      return {
        type: "GENERAL",
        reply: "Không tìm thấy xe phù hợp",
      };
    }

    return {
      type: "DETAIL",
      reply: buildVehicleResponse(best, best.bestVariant),
    };
  }

  // ================= OFFROAD =================
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

    if (!best) {
      return {
        type: "GENERAL",
        reply: "Không tìm thấy xe offroad",
      };
    }

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
  if (entities.models.length === 1) {
    const car = entities.models[0];

    return {
      type: "DETAIL",
      reply: buildVehicleResponse(car, car.bestVariant),
    };
  }

  // ================= SMART RECOMMEND =================
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