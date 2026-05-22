import { getVehicles } from "../services/getVehicles.js";
import Inventory from "../models/Inventory.js";
import CarProblem from "../models/CarProblem.js";

import { bestConceptMatch } from "../ai/semanticEngine.js";
import { mapColors } from "../ai/colorEngine.js";

import {
  buildVehicleResponse,
  buildCompareResponse,
  buildTechnicalResponse,
} from "../ai/responseBuilder.js";

import { salesAdvisor } from "../ai/salesAdvisor.js";

const normalize = (t="") =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");

export const agentCore = async (userId, message) => {
  const [models, inventories, problems] = await Promise.all([
    getVehicles(),
    Inventory.find().lean(),
    CarProblem.find().lean(),
  ]);

  const msg = normalize(message);
  const intent = bestConceptMatch(message);

  // ================= COLOR FIX =================
  if (intent.key === "color") {
    const car = models.find(m =>
      msg.includes(normalize(m.name))
    ) || models[0];

    return {
      type: "VEHICLE_COLOR",
      reply: {
        name: car.name,
        exteriorColors: mapColors(car),
      },
    };
  }

  // ================= TECHNICAL =================
  if (intent.key === "fault") {
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
  if (msg.includes(" vs ")) {
    const [a, b] = models;

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
  const matched = models.filter(m =>
    msg.includes(normalize(m.name))
  );

  if (matched.length === 1) {
    return {
      type: "DETAIL",
      reply: buildVehicleResponse(
        matched[0],
        matched[0].bestVariant
      ),
    };
  }

  // ================= RECOMMEND =================
  if (intent.key === "suv" || intent.key === "pickup") {
    return {
      type: "RECOMMEND",
      reply: models
        .filter(m =>
          intent.key === "suv"
            ? m.type === "SUV"
            : m.type === "Pick-up"
        )
        .map(m => ({
          name: m.name,
          type: m.type,
          seats: m.seats,
          price: m.bestVariant?.basePrice,
          colors: mapColors(m),
        })),
    };
  }

  return {
    type: "GENERAL",
    reply: salesAdvisor({}),
  };
};