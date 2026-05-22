const normalize = (text = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

// ================= SYNONYM MAP =================
const concepts = {
  suv: ["suv", "xe gia dinh", "7 cho", "xe da dung", "xe rong"],
  pickup: ["ban tai", "pickup", "pick up", "xe tai nhe", "offroad"],
  offroad: ["dia hinh", "offroad", "leo doi", "duong rung"],
  economy: ["tiet kiem", "it xang", "diesel", "hybrid"],
  luxury: ["cao cap", "sang trong", "full option"],
};

// ================= SEMANTIC SCORE =================
export const semanticScore = (message, key) => {
  const msg = normalize(message);

  const keywords = concepts[key] || [];

  let score = 0;

  keywords.forEach((k) => {
    if (msg.includes(normalize(k))) {
      score += 1;
    }
  });

  return score;
};

// ================= BEST MATCH =================
export const bestConceptMatch = (message) => {
  let best = { key: null, score: 0 };

  Object.keys(concepts).forEach((key) => {
    const score = semanticScore(message, key);

    if (score > best.score) {
      best = { key, score };
    }
  });

  return best;
};