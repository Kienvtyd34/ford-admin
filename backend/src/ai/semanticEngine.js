export const scoreVehicle = (msg, v) => {
  const m = msg.toLowerCase();

  let score = 0;

  if (m.includes(v.name.toLowerCase())) score += 30;

  if (m.includes("offroad")) {
    if (v.name.includes("Raptor")) score += 40;
    if (v.name.includes("Ranger")) score += 25;
    if (v.name.includes("Everest")) score += 10;
  }

  if (m.includes("7 chỗ") && v.seats >= 7) score += 30;

  if (m.includes("gia đình") && v.seats >= 7) score += 25;

  if (m.includes("suv") && v.type === "SUV") score += 15;

  return score;
};