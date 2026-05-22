// ai/entityEngine.js

import { enrichText, normalize } from "./textEngine.js";

export const extractEntities = (msg, models = []) => {
  const text = enrichText(msg);

  return {
    text,

    models: models.filter((m) =>
      text.includes(normalize(m.name))
    ),

    seats: text.includes("7 cho") ? 7 : null,

    type:
      text.includes("suv") ? "SUV" :
      text.includes("pickup") ? "Pick-up" : null,

    isOffroad:
      text.includes("offroad") ||
      text.includes("dia hinh"),

    isTechnical:
      text.includes("rung") ||
      text.includes("giat") ||
      text.includes("khong mat") ||
      text.includes("dieu hoa") ||
      text.includes("loi"),
  };
};