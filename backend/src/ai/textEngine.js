export const normalize = (t = "") =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const enrichText = (text = "") => {
  const synonyms = {
    rung: ["giat", "khung", "lac"],
    dieuhoa: ["may lanh", "ac", "ac quang"],
    offroad: ["dia hinh", "bun", "dat"],
  };

  let t = normalize(text);

  for (const k in synonyms) {
    if (t.includes(k)) {
      for (const s of synonyms[k]) {
        t += " " + normalize(s);
      }
    }
  }

  return t;
};