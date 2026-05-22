export const safeString = (v, fallback = "Không rõ") => {
  if (!v) return fallback;
  return String(v);
};

export const safeNumber = (v, fallback = null) => {
  if (typeof v === "number") return v;
  if (!isNaN(Number(v))) return Number(v);
  return fallback;
};

export const safeArray = (v) => {
  if (!Array.isArray(v)) return [];
  return v;
};