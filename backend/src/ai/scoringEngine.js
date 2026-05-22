import { enrichText, normalize } from "./textEngine.js";

export const scoreVehicle = (msg, vehicle) => {
  if (!vehicle) return 0;

  const text = enrichText(msg); // 🔥 FIX
  const name = normalize(vehicle.name);
  const type = normalize(vehicle.type);

  let score = 0;

  if (text.includes(name)) score += 10;

  if (text.includes("7 cho") && vehicle.seats >= 7) score += 8;

  if (text.includes("gia dinh") && vehicle.seats >= 7) score += 7;

  if (text.includes("suv") && type.includes("suv")) score += 6;

  if (text.includes("ban tai") && type.includes("pick")) score += 6;

  if (
    text.includes("offroad") &&
    (name.includes("ranger") ||
      name.includes("raptor") ||
      name.includes("everest"))
  ) score += 9;

  return score;
};