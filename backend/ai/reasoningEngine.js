import { extractEntities } from "./brain/entityExtractor.js";
import { rankVehicles } from "./brain/ranker.js";

export const reasoningEngine = (
  message,
  brainResults
) => {
  const entities =
    extractEntities(message);

  // ================= VEHICLES =================

  const vehicles =
    brainResults.filter(
      (r) => r.type === "vehicle"
    );

  const rankedVehicles =
    rankVehicles(
      vehicles,
      entities
    );

  // ================= PROBLEMS =================

  const problems =
    brainResults.filter(
      (r) => r.type === "problem"
    );

  // ================= VARIANTS =================

  const variants =
    brainResults.filter(
      (r) => r.type === "variant"
    );

  // ================= NEWS =================

  const news =
    brainResults.filter(
      (r) => r.type === "news"
    );

  // ================= DECISION =================

  // PROBLEM PRIORITY
  if (
    entities.symptoms.length > 0 &&
    problems.length > 0
  ) {
    return {
      mode: "problem",
      data: problems[0].payload,
    };
  }

  // PRICE MODE
  if (
    message.includes("giá") ||
    message.includes("bao nhiêu")
  ) {
    return {
      mode: "price",
      data: variants
        .slice(0, 5)
        .map((v) => ({
          variantName:
            v.payload.variantName,
          basePrice:
            v.payload.basePrice,
        })),
    };
  }

  // NEWS MODE
  if (
    message.includes("tin tức") ||
    message.includes("khuyến mãi")
  ) {
    return {
      mode: "news",
      data: news
        .slice(0, 3)
        .map((n) => n.payload),
    };
  }

  // SALES MODE
  if (rankedVehicles.length > 0) {
    return {
      mode: "sales",
      data:
        rankedVehicles[0].payload,
    };
  }

  // FALLBACK
  return {
    mode: "fallback",
    reply:
      "🚗 Anh/chị cần xe gia đình, SUV hay bán tải ạ?",
  };
};