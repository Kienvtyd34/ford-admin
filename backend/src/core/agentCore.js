// /core/agentCore.js
import { getVehicleRAG } from "../rag/vehicleRag.js";
import Inventory from "../models/Inventory.js";
import CarProblem from "../models/CarProblem.js";

import { detectConcept } from "../ai/semanticEngine.js";
import { reason } from "../ai/reasoningEngine.js";

import { mapColors } from "../ai/colorEngine.js";
import {
  buildVehicleResponse,
  buildCompareResponse,
  buildTechnicalResponse,
} from "../ai/responseBuilder.js";

const normalize = (t="") =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");

const findCar = (msg, models) =>
  models.find(m => msg.includes(normalize(m.name)));

export const agentCore = async (userId, message) => {

  const [models, inventories, problems] = await Promise.all([
    getVehicleRAG(),
    Inventory.find().lean(),
    CarProblem.find().lean(),
  ]);

  const msg = normalize(message);
  const concept = detectConcept(message);
  const decision = reason(concept, {}, message);

  const car = findCar(msg, models) || models[0];

  // ================= COLOR (FIXED 100%) =================
  if (concept.key === "color") {
    return {
      type: "VEHICLE_COLOR",
      reply: {
        name: car.name,
        exteriorColors: mapColors(car),
      },
    };
  }

  // ================= TECHNICAL =================
  if (concept.key === "fault") {
    const found = problems.find(p =>
      msg.includes(normalize(p.title)) ||
      p.symptoms.some(s => msg.includes(normalize(s)))
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
    const [a, b] = models;

    return {
      type: "COMPARE",
      reply: buildCompareResponse(a, b, a.bestVariant, b.bestVariant),
    };
  }

  // ================= REASONING ENGINE =================
  if (decision === "FAMILY_CAR") {
    return {
      type: "RECOMMEND",
      reply: models.filter(m => m.seats >= 7),
    };
  }

  if (decision === "OFFROAD_CAR") {
    return {
      type: "RECOMMEND",
      reply: models.filter(m => m.type === "Pick-up"),
    };
  }

  // ================= DETAIL =================
  if (car) {
    return {
      type: "DETAIL",
      reply: buildVehicleResponse(car, car.bestVariant),
    };
  }

  // ================= GENERAL (SMART) =================
  return {
    type: "GENERAL",
    reply: {
      message: "Bạn có thể hỏi theo nhu cầu:",
      intents: [
        "xe gia đình",
        "xe offroad",
        "so sánh xe",
        "màu xe",
        "lỗi kỹ thuật",
      ],
    },
  };
};