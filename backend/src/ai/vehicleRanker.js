import { scoreVehicle } from "./scoringEngine.js";

export const rankVehicles = (msg, vehicles) => {
  return vehicles
    .map((v) => ({
      ...v,
      score: scoreVehicle(msg, v),
    }))
    .filter((v) => v.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};