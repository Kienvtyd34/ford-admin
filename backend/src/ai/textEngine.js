export const normalize = (t = "") =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const enrichText = (text = "") => {
  const synonyms = {
    rung: ["giat", "khung", "lac"],
    dieuhoa: ["may lanh", "lanh yeu", "ac"],
    offroad: ["dia hinh", "bun", "dat"],
    suv: ["sport utility"],
    "7 cho": ["7 seats", "family car"],
  };

  let t = normalize(text);

  for (const k in synonyms) {
    if (t.includes(k)) {
      t += " " + synonyms[k].map(normalize).join(" ");
    }
  }

  return t;
};