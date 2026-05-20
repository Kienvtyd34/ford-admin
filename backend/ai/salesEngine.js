// ai/salesEngine.js

// ===============================
// SALES REASONING ENGINE
// ChatGPT-level MongoDB reasoning
// ===============================

const normalize = (text = "") => {
  return text.toLowerCase();
};

const detectNeeds = (message) => {
  const text = normalize(message);

  return {
    family:
      text.includes("gia đình") ||
      text.includes("vợ con"),

    sevenSeats:
      text.includes("7 chỗ") ||
      text.includes("7 seat"),

    fiveSeats:
      text.includes("5 chỗ"),

    pickup:
      text.includes("bán tải") ||
      text.includes("pick-up"),

    suv:
      text.includes("suv"),

    business:
      text.includes("dịch vụ") ||
      text.includes("chạy dịch vụ"),

    offroad:
      text.includes("địa hình") ||
      text.includes("offroad"),

    budgetLow:
      text.includes("dưới 700") ||
      text.includes("700 triệu"),

    budgetMid:
      text.includes("1 tỷ") ||
      text.includes("900 triệu"),

    electric:
      text.includes("xe điện"),
  };
};

// ===============================
// SCORE VEHICLES
// ===============================
const scoreVehicle = (vehicle, needs) => {
  let score = 0;

  // ===== FAMILY =====
  if (needs.family) {
    if (vehicle.payload?.seats >= 5) score += 3;

    if (vehicle.payload?.type === "SUV")
      score += 2;
  }

  // ===== 7 SEATS =====
  if (needs.sevenSeats) {
    if (vehicle.payload?.seats >= 7)
      score += 5;
  }

  // ===== 5 SEATS =====
  if (needs.fiveSeats) {
    if (vehicle.payload?.seats === 5)
      score += 4;
  }

  // ===== PICKUP =====
  if (needs.pickup) {
    if (vehicle.payload?.type === "Pick-up")
      score += 5;
  }

  // ===== SUV =====
  if (needs.suv) {
    if (vehicle.payload?.type === "SUV")
      score += 3;
  }

  // ===== OFFROAD =====
  if (needs.offroad) {
    if (
      vehicle.payload?.name?.includes("Raptor") ||
      vehicle.payload?.name?.includes("Everest")
    ) {
      score += 5;
    }
  }

  // ===== ELECTRIC =====
  if (needs.electric) {
    if (
      vehicle.payload?.name?.toLowerCase()
        .includes("mach-e")
    ) {
      score += 10;
    }
  }

  // ===== HOT VEHICLE =====
  if (vehicle.payload?.isHot)
    score += 1;

  return score;
};

// ===============================
// MAIN REASONING
// ===============================
export const salesReasoning = (
  message,
  brainResults
) => {

  const needs = detectNeeds(message);

  const vehicles = brainResults.filter(
    (r) => r.type === "vehicle"
  );

  if (vehicles.length === 0) {
    return {
      recommendation: null,
      results: [],
    };
  }

  const ranked = vehicles
    .map((v) => ({
      ...v,
      aiScore: scoreVehicle(v, needs),
    }))
    .sort((a, b) => b.aiScore - a.aiScore);

  const best = ranked[0];

  return {
    recommendation: best?.payload || null,
    results: ranked,
  };
};