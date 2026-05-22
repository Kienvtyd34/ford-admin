import VehicleModel from "../models/VehicleModel.js";
import VehicleVariant from "../models/Variant.js";
import Inventory from "../models/Inventory.js";
import CarProblem from "../models/CarProblem.js";

import { detectIntent } from "../ai/intentEngine.js";
import { extractEntities } from "../ai/entityExtractor.js";
import { recommendVehicles } from "../ai/recommendationEngine.js";

import {
  buildVehicleResponse,
  buildCompareResponse,
  buildInventoryResponse,
  buildTechnicalResponse,
} from "../ai/responseBuilder.js";

import { saveMemory } from "../ai/memoryEngine.js";
import { salesAdvisor } from "../ai/salesAdvisor.js";

// ================= NORMALIZE =================
const normalize = (text = "") =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// ================= BEST VARIANT SELECTOR =================
const buildVariantMap = (variants) => {
  const map = new Map();

  for (const v of variants) {
    const key = String(v.modelId);

    if (!map.has(key)) map.set(key, []);
    map.get(key).push(v);
  }

  return map;
};

const getBestVariant = (variantMap, modelId) => {
  const list = variantMap.get(String(modelId)) || [];
  if (!list.length) return null;

  return list.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0))[0];
};

// ================= ATTRIBUTE HANDLER =================
const handleColorQuery = (message, model, variants) => {
  const msg = normalize(message);

  if (!msg.includes("mau") && !msg.includes("màu")) return null;

  const colorsFromVariants = [
    ...new Set(
      variants
        .filter(v => String(v.modelId) === String(model._id))
        .flatMap(v => v.colors || [])
    ),
  ];

  return {
    type: "VEHICLE_COLOR",
    reply: {
      name: model.name,
      exteriorColors:
        model.colors?.exterior ||
        colorsFromVariants ||
        ["Trắng", "Đen", "Bạc", "Xám"],
    },
  };
};

// ================= AGENT CORE =================
export const agentCore = async (userId, message) => {
  const [models, variants, inventories, problems] = await Promise.all([
    VehicleModel.find().lean(),
    VehicleVariant.find().lean(),
    Inventory.find().lean(),
    CarProblem.find().lean(),
  ]);

  const intent = detectIntent(message);
  const entities = extractEntities(message, models, variants);

  saveMemory(userId, entities);

  const variantMap = buildVariantMap(variants);

  // ================= 1. TECHNICAL =================
  if (intent === "TECHNICAL") {
    let found = null;

    const msg = normalize(message);

    for (const p of problems) {
      if (msg.includes(normalize(p.title))) {
        found = p;
        break;
      }

      if (p.symptoms?.some(s => msg.includes(normalize(s)))) {
        found = p;
        break;
      }
    }

    if (found) return buildTechnicalResponse(found);
  }

  // ================= 2. COMPARE =================
  if (intent === "COMPARE" && entities.models.length >= 2) {
    const car1 = entities.models[0];
    const car2 = entities.models[1];

    return buildCompareResponse(
      car1,
      car2,
      getBestVariant(variantMap, car1._id),
      getBestVariant(variantMap, car2._id)
    );
  }

  // ================= 3. COLOR QUERY (FIX CRITICAL BUG) =================
  if (entities.models.length) {
    const colorResult = handleColorQuery(
      message,
      entities.models[0],
      variants
    );

    if (colorResult) return colorResult;
  }

  // ================= 4. VEHICLE DETAIL =================
  if (entities.models.length === 1) {
    const car = entities.models[0];

    return {
      type: "VEHICLE_DETAIL",
      reply: buildVehicleResponse(
        car,
        getBestVariant(variantMap, car._id)
      ),
    };
  }

  // ================= 5. VARIANT ONLY =================
  if (entities.variants.length) {
    const v = entities.variants[0];

    return {
      type: "VARIANT",
      reply: {
        name: v.variantName,
        price: v.basePrice,
        transmission: v.transmission,
        driveTrain: v.driveTrain,
      },
    };
  }

  // ================= 6. RECOMMEND =================
  if (intent === "RECOMMEND") {
    const recs = recommendVehicles({ entities, models });

    return {
      type: "RECOMMEND",
      reply: recs.map(car => ({
        name: car.name,
        type: car.type,
        seats: car.seats,
        variant: getBestVariant(variantMap, car._id),
      })),
    };
  }

  // ================= 7. TEST DRIVE =================
  if (intent === "TEST_DRIVE") {
    const list = inventories.filter(i => i.testDriveAvailable);

    return {
      type: "TEST_DRIVE",
      reply: list.map(buildInventoryResponse),
    };
  }

  // ================= FALLBACK =================
  return {
    type: "GENERAL",
    reply: salesAdvisor(entities),
  };
};