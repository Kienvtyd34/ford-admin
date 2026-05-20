export const rankVehicles = (
  vehicles,
  entities
) => {
  return vehicles
    .map((v) => {
      let score = v.score || 0;

      // seats
      if (entities.seats) {
        if (v.payload.seats === entities.seats) {
          score += 0.5;
        }
      }

      // type
      if (entities.type) {
        if (
          v.payload.type
            ?.toLowerCase()
            .includes(
              entities.type.toLowerCase()
            )
        ) {
          score += 0.4;
        }
      }

      // family
      if (
        entities.usage === "family"
      ) {
        if (
          v.payload.type === "SUV"
        ) {
          score += 0.3;
        }

        if (v.payload.seats >= 5) {
          score += 0.3;
        }
      }

      return {
        ...v,
        finalScore: score,
      };
    })
    .sort(
      (a, b) =>
        b.finalScore - a.finalScore
    );
};