// src/ai/recommendationEngine.js

export const recommendVehicles = ({
  entities,
  models,
}) => {

  let results = [...models];

  // ================= TYPE =================

  if (
    entities.type
  ) {

    results = results.filter(
      (v) =>
        v.type?.toLowerCase() ===
        entities.type.toLowerCase()
    );
  }

  // ================= SEATS =================

  if (
    entities.seats
  ) {

    results = results.filter(
      (v) =>
        v.seats >= entities.seats
    );
  }

  // ================= OFFROAD =================

  if (
    entities.offroad
  ) {

    results = results.filter(
      (v) =>
        v.type === "Pick-up"
    );
  }

  return results.slice(0, 5);
};