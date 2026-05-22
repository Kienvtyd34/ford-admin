export const detectIntent = (msg = "") => {
  const m = msg.toLowerCase();

  if (
    m.includes("rung") ||
    m.includes("giật") ||
    m.includes("lỗi") ||
    m.includes("điều hoà") ||
    m.includes("không lạnh") ||
    m.includes("kém lạnh") ||
    m.includes("máy yếu")
  ) {
    return "TECHNICAL";
  }

  if (m.includes("7 chỗ") || m.includes("gia đình")) return "FAMILY";
  if (m.includes("offroad")) return "OFFROAD";
  if (m.includes("màu")) return "COLOR";

  return "GENERAL";
};