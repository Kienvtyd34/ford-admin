export const rankVehicles = (
  vehicles,
  entities
) => {

  return vehicles
    .map((v) => {

      let score = 0;

      // =====================
      // SUV
      // =====================

      if (
        entities.type &&
        v.payload.type
      ) {

        if (
          v.payload.type
            .toLowerCase() ===
          entities.type.toLowerCase()
        ) {
          score += 4;
        }
      }

      // =====================
      // SEATS
      // =====================

      if (
        entities.seats &&
        v.payload.seats ===
          entities.seats
      ) {
        score += 3;
      }

      // =====================
      // FAMILY
      // =====================

      if (
        entities.usage ===
        "family"
      ) {

        if (
          v.payload.type ===
          "SUV"
        ) {
          score += 2;
        }
      }

      // =====================
      // BUDGET
      // =====================

      if (
        entities.budget &&
        v.payload.startPrice
      ) {

        if (
          v.payload.startPrice <=
          entities.budget
        ) {
          score += 3;
        }
      }

      return {
        ...v,
        finalScore: score,
      };
    })
    .sort(
      (a, b) =>
        b.finalScore -
        a.finalScore
    );
};