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

  // SUV

  if (
    text.includes("suv") ||
    text.includes("cuv") ||
    text.includes("crossover")
  ) {
    entities.type = "SUV";
  }

  // SEDAN

  if (
    text.includes("sedan")
  ) {
    entities.type = "Sedan";
  }

  // PICKUP

  if (
    text.includes("ban tai") ||
    text.includes("pickup") ||
    text.includes("truck")
  ) {
    entities.type = "Pickup";
  }

  // =================
  // SEATS
  // =================

  if (
    text.includes("5 cho") ||
    text.includes("5cho") ||
    text.includes("5 seat")
  ) {
    entities.seats = 5;
  }

  if (
    text.includes("7 cho") ||
    text.includes("7cho") ||
    text.includes("7 seat")
  ) {
    entities.seats = 7;
  }

  // =================
  // FAMILY
  // =================

  if (
    text.includes("gia dinh") ||
    text.includes("family")
  ) {
    entities.usage = "family";
  }

  // =================
  // BUDGET TY
  // =================

  const ty =
    text.match(
      /(\d+(\.\d+)?)\s*ty/
    );

  if (ty) {

    entities.budget =
      Number(ty[1]) *
      1000000000;
  }

  // =================
  // BUDGET TRIEU
  // =================

  const trieu =
    text.match(
      /(\d+)\s*trieu/
    );

  if (trieu) {

    entities.budget =
      Number(trieu[1]) *
      1000000;
  }

  // =================
  // UNDER BUDGET
  // =================

  if (
    text.includes("duoi 1 ty")
  ) {
    entities.budget =
      1000000000;
  }

  // =================
  // INSTALLMENT
  // =================

  if (
    text.includes("tra gop")
  ) {
    entities.installment = true;
  }

  // =================
  // TEST DRIVE
  // =================

  if (
    text.includes("lai thu") ||
    text.includes("test drive")
  ) {
    entities.testDrive = true;
  }

  return entities;
};