import { normalizeText } from "./normalizeData.js";

export const extractEntities = (
  message
) => {

  const text =
    normalizeText(message);

  const entities = {
    seats: null,
    budget: null,
    type: null,
    usage: null,
  };

  // =================
  // SEATS
  // =================

  if (
    text.includes("7 cho")
  ) {
    entities.seats = 7;
  }

  if (
    text.includes("5 cho")
  ) {
    entities.seats = 5;
  }

  // =================
  // TYPE
  // =================

  if (
    text.includes("suv")
  ) {
    entities.type = "SUV";
  }

  if (
    text.includes("ban tai")
  ) {
    entities.type = "Pickup";
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

  const billion =
    text.match(
      /(\d+)\s*ty/
    );

  if (billion) {

    entities.budget =
      Number(billion[1]) *
      1000000000;
  }

  const million =
    text.match(
      /(\d+)\s*trieu/
    );

  if (million) {

    entities.budget =
      Number(million[1]) *
      1000000;
  }

  return entities;
};