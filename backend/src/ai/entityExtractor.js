import { normalize } from "./normalize.js";

export const extractEntities = (
  message,
  models = [],
  variants = []
) => {
  const q = normalize(message);

  const entities = {
    models: [],
    variants: [],
    type: null,
    seats: null,
    budget: null,
    usage: null,
  };

  // model
  models.forEach((m) => {
    if (q.includes(normalize(m.name))) {
      entities.models.push(m);
    }
  });

  // variant
  variants.forEach((v) => {
    if (
      q.includes(normalize(v.variantName))
    ) {
      entities.variants.push(v);
    }
  });

  // SUV
  if (q.includes("suv"))
    entities.type = "SUV";

  // pickup
  if (
    q.includes("ban tai") ||
    q.includes("pickup")
  )
    entities.type = "Pick-up";

  // seats
  if (q.includes("7 cho"))
    entities.seats = 7;

  if (q.includes("5 cho"))
    entities.seats = 5;

  // family
  if (
    q.includes("gia dinh") ||
    q.includes("tre em")
  )
    entities.usage = "family";

  // offroad
  if (
    q.includes("offroad") ||
    q.includes("dia hinh")
  )
    entities.usage = "offroad";

  // tiết kiệm
  if (
    q.includes("tiet kiem") ||
    q.includes("it ton xang")
  )
    entities.usage = "economy";

  // budget
  const budgetMatch =
    q.match(/(\d+)\s*ty/);

  if (budgetMatch) {
    entities.budget =
      Number(budgetMatch[1]) * 1000000000;
  }

  return entities;
};