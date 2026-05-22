
// /ai/reasoningEngine.js

export const reason = (intent, entities, msg) => {
  const text = msg.toLowerCase();

  // FAMILY LOGIC
  if (text.includes("gia dinh") || entities.seats >= 7) {
    return "FAMILY_CAR";
  }

  // OFFROAD LOGIC
  if (text.includes("offroad") || text.includes("dia hinh")) {
    return "OFFROAD_CAR";
  }

  // COMFORT LOGIC
  if (text.includes("tiet kiem") || text.includes("nhien lieu")) {
    return "ECONOMY";
  }

  return "GENERAL";
};