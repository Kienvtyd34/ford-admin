import { enrichText, normalize } from "./textEngine.js";

export const extractEntities = (msg, models = []) => {
  const text = enrichText(msg);

  return {
    text,

    models: models.filter((m) => {
      const name = normalize(m.name || "");
      return text.includes(name) || name.includes(text);
    }),

    seats: text.includes("7 chỗ") ? 7 : null,

    type:
      text.includes("suv")
        ? "SUV"
        : text.includes("pickup")
        ? "Pick-up"
        : null,

    isTechnical:
      text.includes("rung") ||
      text.includes("giật") ||
      text.includes("lỗi") ||
      text.includes("không mát") ||
      text.includes("điều hòa"),

    isOffroad:
      text.includes("offroad") || text.includes("địa hình"),
  };
};