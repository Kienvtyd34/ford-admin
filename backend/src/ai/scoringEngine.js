export const scoreVehicle = (msg, v) => {
  let score = 0;
  const t = msg.toLowerCase();

  const name = (v.name || "").toLowerCase();
  const type = (v.type || "").toLowerCase();

  if (t.includes(name)) score += 10;

  if (t.includes("7 chỗ") && v.seats >= 7) score += 8;
  if (t.includes("gia đình") && v.seats >= 7) score += 7;

  if (
    t.includes("offroad") &&
    (name.includes("ranger") || name.includes("raptor") || name.includes("everest"))
  ) {
    score += 9;
  }

  if (t.includes("suv") && type.includes("suv")) score += 5;
  if (t.includes("bán tải") && type.includes("pick")) score += 5;

  return score;
};