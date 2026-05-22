export const detectIntent = (msg = "") => {
  const m = msg.toLowerCase();

  const isVehicle =
    m.includes("7 chỗ") ||
    m.includes("gia đình") ||
    m.includes("suv") ||
    m.includes("xe");

  const isTech =
    m.includes("rung") ||
    m.includes("giật") ||
    m.includes("lỗi") ||
    m.includes("điều hoà");

  if (isVehicle && !isTech) return "VEHICLE";
  if (isTech) return "TECHNICAL";

  return "GENERAL";
};