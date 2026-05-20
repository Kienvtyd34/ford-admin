import { extractEntities } from "./brain/entityExtractor.js";
import { rankVehicles } from "./brain/ranker.js";

export const salesEngine = async (
  message,
  results,
  context = {}
) => {

  // ================= EXTRACT =================

  const entities =
    extractEntities(message);

  // ================= MERGE CONTEXT =================

  const merged = {
    seats:
      entities.seats ||
      context.seats,

    type:
      entities.type ||
      context.type,

    budget:
      entities.budget ||
      context.budget,

    usage:
      entities.usage ||
      context.usage,
  };

  // ================= VEHICLES =================

  const vehicles =
    results.filter(
      (r) =>
        r.type === "vehicle"
    );

  // ================= ASK FLOW =================

  if (!merged.type) {
    return {
      success: false,
      entities: merged,
      askBack:
        "Anh/chị thích SUV, sedan hay bán tải ạ?",
    };
  }

  if (!merged.seats) {
    return {
      success: false,
      entities: merged,
      askBack:
        "Anh/chị cần xe 5 hay 7 chỗ ạ?",
    };
  }

  // ================= FILTER =================

  let filtered = vehicles;

  if (merged.type) {
    filtered =
      filtered.filter(
        (v) =>
          v.payload.type
            ?.toLowerCase()
            .includes(
              merged.type.toLowerCase()
            )
      );
  }

  if (merged.seats) {
    filtered =
      filtered.filter(
        (v) =>
          Number(v.payload.seats) ===
          Number(merged.seats)
      );
  }

  // ================= RANK =================

  const ranked =
    rankVehicles(
      filtered,
      merged
    );

  const best = ranked[0];

  if (!best) {
    return {
      success: false,
      entities: merged,
      askBack:
        "Hiện chưa tìm thấy mẫu phù hợp",
    };
  }

  return {
    success: true,
    data: best.payload,
    entities: merged,
  };
};