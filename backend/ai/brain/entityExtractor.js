import { normalizeText } from "./normalizeData.js";

export const extractEntities = (
  message
) => {

  const text =
    normalizeText(message);

  const entities = {};

  // =================
  // TYPE
  // =================

  if (
    text.includes("suv")
  ) {
    entities.type = "SUV";
  }

  if (
    text.includes("sedan")
  ) {
    entities.type = "Sedan";
  }

  if (
    text.includes("ban tai")
  ) {
    entities.type = "Pickup";
  }

  // =================
  // SEATS
  // =================

  if (
    text.includes("5 cho")
  ) {
    entities.seats = 5;
  }

  if (
    text.includes("7 cho")
  ) {
    entities.seats = 7;
  }

  // =================
  // FAMILY
  // =================

  if (
    text.includes("gia dinh")
  ) {
    entities.usage = "family";
  }

  // =================
  // BUDGET
  // =================

  const ty =
    text.match(
      /(\d+)\s*ty/
    );

  if (ty) {

    entities.budget =
      Number(ty[1]) *
      1000000000;
  }

  const trieu =
    text.match(
      /(\d+)\s*trieu/
    );

  if (trieu) {

    entities.budget =
      Number(trieu[1]) *
      1000000;
  }

  return entities;
};