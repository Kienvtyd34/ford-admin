import { extractEntities } from "./brain/entityExtractor.js";
import { rankVehicles } from "./brain/ranker.js";

export const salesEngine = async (
  message,
  results,
  context = {}
) => {

  const entities =
    extractEntities(message);

  const vehicles =
    results.filter(
      (r) => r.type === "vehicle"
    );

  // =====================
  // USE CONTEXT MEMORY
  // =====================

  if (
    context?.lastVehicle &&
    !entities.seats
  ) {
    entities.seats =
      context.lastVehicle.seats;
  }

  // =====================
  // NO VEHICLE FOUND
  // =====================

  if (vehicles.length === 0) {

    return {
      success: false,
      askBack:
        "Anh/chị thích SUV, bán tải hay sedan ạ?",
    };
  }

  // =====================
  // RANK
  // =====================

  const ranked =
    rankVehicles(
      vehicles,
      entities
    );

  const best = ranked[0];

  if (!best) {

    return {
      success: false,
      askBack:
        "Anh/chị muốn xe 5 hay 7 chỗ ạ?",
    };
  }

  return {
    success: true,
    data: best.payload,
  };
};