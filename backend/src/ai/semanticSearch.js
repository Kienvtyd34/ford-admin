import { normalize } from "./normalize.js";

export const semanticSearch = (
  message,
  models = []
) => {
  const q = normalize(message);

  return models.filter((m) => {
    const name = normalize(m.name);

    if (q.includes(name))
      return true;

    if (
      q.includes("gia dinh") &&
      m.seats >= 7
    )
      return true;

    if (
      q.includes("offroad") &&
      (
        name.includes("ranger") ||
        name.includes("raptor")
      )
    )
      return true;

    return false;
  });
};