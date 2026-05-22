

export const safe = {
  str: (v, fb = "Không rõ") => (v ? String(v) : fb),

  num: (v, fb = null) => {
    const n = Number(v);
    return isNaN(n) ? fb : n;
  },

  arr: (v) => (Array.isArray(v) ? v : []),

  obj: (v) => (v && typeof v === "object" ? v : null),
};
export default safe;