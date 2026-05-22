// ai/vehicleRag.js

import { enrichText, normalize } from "./textEngine.js";

export const matchVehicles = (msg, models) => {
  const text = enrichText(msg);

  return models.filter((m) => {
    const name = normalize(m.name);
    const type = normalize(m.type);

    if (text.includes(name)) return true;
    if (text.includes("suv") && type.includes("suv")) return true;
    if (text.includes("7 cho") && m.seats >= 7) return true;

    if (
      (text.includes("pickup") || text.includes("ban tai")) &&
      type.includes("pick")
    )
      return true;

    if (
      (text.includes("offroad") || text.includes("dia hinh")) &&
      (name.includes("ranger") ||
        name.includes("raptor") ||
        name.includes("everest"))
    )
      return true;

    return false;
  });
};