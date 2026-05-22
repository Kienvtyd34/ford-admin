export const detectIntent = (msg = "", entities = {}) => {
  const m = msg.toLowerCase();

  if (entities.isTechnical) return "TECHNICAL";
  if (m.includes("so sanh") || m.includes("vs")) return "COMPARE";
  if (m.includes("7 cho") || m.includes("gia dinh")) return "FAMILY";
  if (m.includes("offroad")) return "OFFROAD";
  if (m.includes("mau")) return "COLOR";

  return "GENERAL";
};