import { enrichText, normalize } from "./textEngine.js";

export const extractEntities = (msg, models = []) => {
  const text = enrichText(msg);

  const modelsMatched = models.filter((m) => {
    if (!m?.name) return false;
    return text.includes(normalize(m.name));
  });

  return {
    text,
    models: modelsMatched,
    seats: text.includes("7 cho") ? 7 : null,
    type: text.includes("suv")
      ? "SUV"
      : text.includes("pickup")
      ? "Pick-up"
      : null,
    isOffroad: text.includes("offroad") || text.includes("dia hinh"),
    isTechnical:
      text.includes("rung") ||
      text.includes("giat") ||
      text.includes("loi") ||
      text.includes("dieu hoa"),
  };
};