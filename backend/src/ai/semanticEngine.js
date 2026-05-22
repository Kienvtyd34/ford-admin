const normalize = (t = "") =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// ===== HARD INTENT MAP =====
export const detectUserNeed = (message) => {
  const msg = normalize(message);

  // FAMILY
  if (msg.includes("7 cho") || msg.includes("gia dinh")) {
    return { type: "FAMILY", seats: 7 };
  }

  // OFFROAD
  if (msg.includes("offroad") || msg.includes("dia hinh")) {
    return { type: "OFFROAD" };
  }

  // ERROR
  if (msg.includes("loi") || msg.includes("rung") || msg.includes("giat")) {
    return { type: "TECHNICAL" };
  }

  // COLOR
  if (msg.includes("mau")) {
    return { type: "COLOR" };
  }

  return { type: "GENERAL" };
};