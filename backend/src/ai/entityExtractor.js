// src/ai/entityExtractor.js

export const extractEntities = (
  message,
  models,
  variants
) => {

  const lower =
    message.toLowerCase();

  const entities = {

    models: [],
    variants: [],

    type: null,
    seats: null,

    offroad: false,
  };

  // ================= MODELS =================

  entities.models =
    models.filter((m) =>
      lower.includes(
        m.name.toLowerCase()
      )
    );

  // ================= VARIANTS =================

  entities.variants =
    variants.filter((v) =>
      lower.includes(
        v.variantName.toLowerCase()
      )
    );

  // ================= TYPE =================

  if (
    lower.includes("suv")
  ) {
    entities.type = "SUV";
  }

  if (
    lower.includes("bán tải")
  ) {
    entities.type = "Pick-up";
  }

  // ================= SEATS =================

  if (
    lower.includes("7 chỗ")
  ) {
    entities.seats = 7;
  }

  if (
    lower.includes("5 chỗ")
  ) {
    entities.seats = 5;
  }

  // ================= OFFROAD =================

  if (
    lower.includes("offroad")
  ) {
    entities.offroad = true;
  }

  return entities;
};