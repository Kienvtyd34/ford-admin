import { extractEntities } from "./brain/entityExtractor.js";
import { rankVehicles } from "./brain/ranker.js";

// ================= NORMALIZE =================

const normalize = (text = "") => {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

export const salesEngine = async (
  message,
  results,
  context = {}
) => {

  // ================= ENTITIES =================

  const entities =
    extractEntities(message);

  // ================= MERGE =================

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

  // DEBUG

  console.log(
    "🚗 VEHICLES:",
    vehicles.length
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

  let filtered = [...vehicles];

  // ===== TYPE =====

  if (merged.type) {

    const wantedType =
  normalize(merged.type);

filtered = filtered.filter((v) => {

  const vehicleType =
    normalize(
      v.payload.type
    );

  // ================= SUV =================

  if (wantedType === "suv") {

    return (
      vehicleType.includes("suv") ||
      vehicleType.includes("cuv") ||
      vehicleType.includes("crossover") ||
      vehicleType.includes("sport utility")
    );
  }

  // ================= SEDAN =================

  if (wantedType === "sedan") {

    return (
      vehicleType.includes("sedan")
    );
  }

  // ================= PICKUP =================

  if (
    wantedType === "ban tai" ||
    wantedType === "pickup"
  ) {

    return (
      vehicleType.includes("pickup") ||
      vehicleType.includes("ban tai") ||
      vehicleType.includes("truck")
    );
  }

  return vehicleType.includes(
    wantedType
  );
});

    console.log(
      "🚙 AFTER TYPE:",
      filtered.length
    );
  }

  // ===== SEATS =====

  if (merged.seats) {

    filtered = filtered.filter((v) => {

      const seats =
        Number(v.payload.seats);

      return (
        seats ===
        Number(merged.seats)
      );
    });

    console.log(
      "👥 AFTER SEATS:",
      filtered.length
    );
  }

  // ================= FALLBACK =================

  if (filtered.length === 0) {

    console.log(
      "❌ NO MATCH VEHICLE"
    );

    return {
      success: false,
      entities: merged,
      askBack:
        "Hiện chưa tìm thấy mẫu phù hợp",
    };
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
        "Hiện chưa tìm thấy xe phù hợp",
    };
  }

  console.log(
    "✅ BEST:",
    best.payload.name
  );

  return {
    success: true,
    data: best.payload,
    entities: merged,
  };
};