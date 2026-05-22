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

// ================= AGGREGATION ENGINE =================
const getVehicles = async () => {
  return await VehicleModel.aggregate([
    {
      $lookup: {
        from: "vehiclevariants",
        localField: "_id",
        foreignField: "modelId",
        as: "variants",
      },
    },
    {
      $lookup: {
        from: "inventories",
        localField: "_id",
        foreignField: "vehicleId",
        as: "inventory",
      },
    },

    // BEST VARIANT
    {
      $addFields: {
        bestVariant: {
          $arrayElemAt: [
            {
              $sortArray: {
                input: "$variants",
                sortBy: { basePrice: -1 },
              },
            },
            0,
          ],
        },
      },
    },

    // COLORS FIX (ROBUST)
    {
      $addFields: {
        allColors: {
          $reduce: {
            input: {
              $map: {
                input: "$variants",
                as: "v",
                in: {
                  $ifNull: ["$$v.colors.exterior", []],
                },
              },
            },
            initialValue: [],
            in: { $setUnion: ["$$value", "$$this"] },
          },
        },
      },
    },

    // CLEAN OUTPUT
    {
      $project: {
        name: 1,
        type: 1,
        seats: 1,
        colors: 1,
        variants: 1,
        bestVariant: 1,
        allColors: 1,
        inventory: 1,
      },
    },
  ]);
};

// ================= COLOR MERGE =================
const getColors = (car) => {
  return [
    ...new Set([
      ...(car.colors?.exterior || []),
      ...(car.allColors || []),
    ]),
  ].filter(Boolean);
};

// ================= BEST VARIANT =================
const getBestVariant = (car) => {
  if (car.bestVariant) return car.bestVariant;

  return car.variants?.sort(
    (a, b) => (b.basePrice || 0) - (a.basePrice || 0)
  )[0];
};

// ================= CORE =================
export const agentCore = async (userId, message) => {
  const [models, inventories, problems] = await Promise.all([
    getVehicles(),
    Inventory.find().lean(),
    CarProblem.find().lean(),
  ]);

  const intent = detectIntent(message);
  const entities = extractEntities(message, models, []);

  saveMemory(userId, entities);

  const msg = normalize(message);

  // ================= TECHNICAL =================
  if (intent === "TECHNICAL") {
    let found = null;

    for (const p of problems) {
      if (msg.includes(normalize(p.title))) {
        found = p;
        break;
      }

      if (p.symptoms?.some((s) => msg.includes(normalize(s)))) {
        found = p;
        break;
      }
    }

    if (found) return buildTechnicalResponse(found);
  }

  // ================= COMPARE =================
  if (intent === "COMPARE" && entities.models.length >= 2) {
    const car1 = entities.models[0];
    const car2 = entities.models[1];

    return buildCompareResponse(
      car1,
      car2,
      getBestVariant(car1),
      getBestVariant(car2)
    );
  }

  // ================= COLOR =================
  if (msg.includes("màu") || msg.includes("mau")) {
    const car = entities.models[0] || models[0];

    return {
      type: "VEHICLE_COLOR",
      reply: {
        name: car.name,
        exteriorColors: getColors(car),
      },
    };
  }

  // ================= VEHICLE DETAIL =================
  if (entities.models.length === 1) {
    const car = entities.models[0];

    return {
      type: "VEHICLE_DETAIL",
      reply: buildVehicleResponse(car, getBestVariant(car)),
    };
  }

  // ================= VARIANT =================
  if (entities.variants?.length) {
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

  // ================= RECOMMEND =================
  if (intent === "RECOMMEND") {
    const recs = recommendVehicles({ entities, models });

    return {
      type: "RECOMMEND",
      reply: recs.map((car) => ({
        name: car.name,
        type: car.type,
        seats: car.seats,
        price: getBestVariant(car)?.basePrice,
        colors: getColors(car),
        hasInventory: car.inventory?.length > 0,
      })),
    };
  }

  // ================= TEST DRIVE =================
  if (intent === "TEST_DRIVE") {
    const list = inventories.filter((i) => i.testDriveAvailable);

    return {
      type: "TEST_DRIVE",
      reply: list.map(buildInventoryResponse),
    };
  }

  // ================= DEFAULT =================
  return {
    type: "GENERAL",
    reply: salesAdvisor(entities),
  };
};