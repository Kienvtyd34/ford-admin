export const scoreVehicle = (msg, vehicle) => {
  let score = 0;
  const text = msg.toLowerCase();

  const name = (vehicle.name || "").toLowerCase();
  const type = (vehicle.type || "").toLowerCase();

  // NAME MATCH
  if (text.includes(name)) score += 10;

  // FAMILY
  if (text.includes("7 chỗ") && vehicle.seats >= 7) score += 8;
  if (text.includes("gia đình") && vehicle.seats >= 7) score += 7;

  // OFFROAD
  if (
    text.includes("offroad") &&
    (name.includes("ranger") ||
      name.includes("raptor") ||
      name.includes("everest"))
  ) {
    score += 9;
  }

  // TYPE MATCH
  if (text.includes("suv") && type.includes("suv")) score += 6;
  if (text.includes("bán tải") && type.includes("pick")) score += 6;

  return score;
};