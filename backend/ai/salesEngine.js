import { extractEntities } from "./brain/entityExtractor.js";
import { rankVehicles } from "./brain/ranker.js";

export const salesEngine = async (
  message,
  results,
  context = {}
) => {

  // =========================
  // EXTRACT CURRENT ENTITIES
  // =========================

  const current =
    extractEntities(message);

  // =========================
  // MERGE OLD CONTEXT
  // =========================

  const entities = {
    ...(context.entities || {}),
    ...current,
  };

  // =========================
  // VEHICLES
  // =========================

  const vehicles =
    results.filter(
      (r) => r.type === "vehicle"
    );

  // =========================
  // NO VEHICLES
  // =========================

  if (!vehicles.length) {

    return {
      success: false,
      askBack:
        "Anh/chị thích SUV, sedan hay bán tải ạ?",
      entities,
    };
  }

  // =========================
  // RANK
  // =========================

  const ranked =
    rankVehicles(
      vehicles,
      entities
    );

  const best = ranked[0];

  // =========================
  // SCORE TOO LOW
  // =========================

  if (
    !best ||
    best.finalScore < 2
  ) {

    // ASK TYPE

    if (!entities.type) {

      return {
        success: false,
        askBack:
          "Anh/chị thích SUV, sedan hay bán tải ạ?",
        entities,
      };
    }

    // ASK SEATS

    if (!entities.seats) {

      return {
        success: false,
        askBack:
          "Anh/chị cần xe 5 hay 7 chỗ ạ?",
        entities,
      };
    }

    // ASK BUDGET

    if (!entities.budget) {

      return {
        success: false,
        askBack:
          "Ngân sách khoảng bao nhiêu ạ?",
        entities,
      };
    }
  }

  return {
    success: true,
    data: best.payload,
    entities,
  };
};