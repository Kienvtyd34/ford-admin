export const rankVehicles = (
  vehicles,
  entities
) => {

  return vehicles
    .map((v) => {

      let score =
        v.score || 0;

      // =================
      // SEATS
      // =================

      if (
        entities.seats
      ) {

        if (
          v.payload.seats ===
          entities.seats
        ) {
          score += 3;
        }
      }

      // =================
      // TYPE
      // =================

      if (
        entities.type
      ) {

        if (
          v.payload.type
            ?.toLowerCase() ===
          entities.type.toLowerCase()
        ) {
          score += 2;
        }
      }

      // =================
      // FAMILY
      // =================

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

      // =================
      // BUDGET
      // =================

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