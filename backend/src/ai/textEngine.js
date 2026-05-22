export const normalize = (t = "") =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const enrichText = (text = "") => {
  const synonyms = {
    rung: ["giật", "khựng"],
    offroad: ["địa hình", "bùn"],
    dieuhoa: ["máy lạnh"],
  };

  let t = normalize(text);

  for (const k in synonyms) {
    if (t.includes(k)) {
      synonyms[k].forEach((s) => (t += " " + s));
    }
  }

  return t;
};