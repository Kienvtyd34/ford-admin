export const detectIntent = (msg = "") => {
  const m = msg.toLowerCase();

  // COLOR
  if (m.includes("màu") || m.includes("mau")) return "COLOR";

  // FAMILY
  if (m.includes("7 chỗ") || m.includes("gia đình")) return "FAMILY";

  // OFFROAD
  if (m.includes("offroad") || m.includes("địa hình")) return "OFFROAD";

  // TECHNICAL
  if (
    m.includes("rung") ||
    m.includes("giật") ||
    m.includes("lỗi") ||
    m.includes("điều hòa") ||
    m.includes("không lạnh")
  ) {
    return "TECHNICAL";
  }

  // COMPARE
  if (m.includes("vs") || m.includes("so sánh")) return "COMPARE";

  return "GENERAL";
};