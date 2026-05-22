export const detectIntent = (msg, entities) => {
  const m = msg.toLowerCase();

  if (entities.isTechnical) return "TECHNICAL";
  if (m.includes("so sánh")) return "COMPARE";
  if (m.includes("7 chỗ") || m.includes("gia đình")) return "FAMILY";
  if (m.includes("offroad")) return "OFFROAD";
  if (m.includes("màu")) return "COLOR";

  return "GENERAL";
};