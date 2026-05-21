export const recommendVehicles = ({
  entities,
  models,
  variants,
}) => {
  let filtered = [...models];

  if (entities.type) {
    filtered = filtered.filter(
      (m) => m.type === entities.type
    );
  }

  if (entities.seats) {
    filtered = filtered.filter(
      (m) => m.seats >= entities.seats
    );
  }

  // gia đình
  if (entities.usage === "family") {
    filtered = filtered.filter(
      (m) =>
        m.type === "SUV" &&
        m.seats >= 7
    );
  }

  // offroad
  if (entities.usage === "offroad") {
    filtered = filtered.filter(
      (m) =>
        m.name.includes("Ranger") ||
        m.name.includes("Raptor") ||
        m.name.includes("Everest")
    );
  }

  // tiết kiệm
  if (entities.usage === "economy") {
    filtered = filtered.filter(
      (m) =>
        !m.name.includes("Mustang")
    );
  }

  return filtered;
};