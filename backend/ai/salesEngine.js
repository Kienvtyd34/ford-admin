import { extractEntities } from "./brain/entityExtractor.js";
import { rankVehicles } from "./brain/ranker.js";

export const salesEngine = async (
  message,
  results
) => {
  const entities = extractEntities(message);

  const vehicles = results.filter(
    (r) => r.type === "vehicle"
  );

  // ================= ASK BACK =================

  if (
    vehicles.length === 0 &&
    !entities.seats &&
    !entities.budget
  ) {
    return {
      success: false,
      askBack:
        "Anh/chị cần xe 5 hay 7 chỗ và ngân sách khoảng bao nhiêu ạ?",
    };
  }

  const ranked = rankVehicles(
    vehicles,
    entities
  );

  const best = ranked[0];

  if (!best) {
    return {
      success: false,
      askBack:
        "Anh/chị thích SUV hay bán tải ạ?",
    };
  }

  return {
    success: true,
    data: best.payload,
  };
};