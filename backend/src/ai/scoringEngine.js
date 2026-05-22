export const scoreVehicle = (msg, vehicle) => {
  if (!vehicle) return 0;

  const text = msg.toLowerCase();
  const name = (vehicle.name || "").toLowerCase();
  const type = (vehicle.type || "").toLowerCase();

  let score = 0;

  if (text.includes(name)) score += 10;

  if (text.includes("7 chỗ") && vehicle.seats >= 7) score += 8;

  if (text.includes("gia đình") && vehicle.seats >= 7) score += 7;

  if (text.includes("suv") && type.includes("suv")) score += 6;

  if (
    text.includes("bán tải") &&
    type.includes("pick")
  ) score += 6;

  if (
    text.includes("offroad") &&
    (name.includes("ranger") ||
      name.includes("raptor") ||
      name.includes("everest"))
  ) score += 9;

  return score;
};