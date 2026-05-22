const normalize = (text = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

// semantic weight scoring
export const bestConceptMatch = (message) => {
  const msg = normalize(message);

  const rules = [
    { key: "suv", words: ["suv", "7 cho", "xe gia dinh"] },
    { key: "pickup", words: ["ban tai", "pickup", "offroad"] },
    { key: "fault", words: ["loi", "rung", "giat", "khong lanh", "khong no"] },
    { key: "color", words: ["mau", "son", "mau sac"] },
  ];

  let best = { key: null, score: 0 };

  for (const r of rules) {
    let score = 0;

    for (const w of r.words) {
      if (msg.includes(w)) score++;
    }

    if (score > best.score) {
      best = { key: r.key, score };
    }
  }

  return best;
};