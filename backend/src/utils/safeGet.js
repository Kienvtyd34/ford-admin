export const safeString = (v, fallback = "Không rõ") =>
  v ? String(v) : fallback;

export const safeNumber = (v, fallback = null) =>
  isNaN(Number(v)) ? fallback : Number(v);

export const safeArray = (v) =>
  Array.isArray(v) ? v : [];