export const normalize = (text = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const synonyms = {
  rung: ["giật", "khựng", "lắc"],
  dieuhoa: ["ac", "máy lạnh"],
  offroad: ["địa hình", "bùn"],
};

export const enrichText = (text = "") => {
  let t = normalize(text);

  for (const k in synonyms) {
    if (t.includes(k)) {
      synonyms[k].forEach((s) => (t += " " + s));
    }
  }

  return t;
};