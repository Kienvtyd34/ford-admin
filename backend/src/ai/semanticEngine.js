// /ai/semanticEngine.js
const normalize = (t="") =>
  t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");

const concepts = {
  suv: ["suv", "7 cho", "xe gia dinh", "rong rai"],
  pickup: ["ban tai", "offroad", "ranger", "raptor"],
  fault: ["loi", "rung", "giat", "khong lanh", "khong no", "abs"],
  color: ["mau", "son", "ngoai that"],
};

export const semanticScore = (msg, key) => {
  const text = normalize(msg);
  return (concepts[key] || []).reduce((acc, w) => {
    return acc + (text.includes(normalize(w)) ? 1 : 0);
  }, 0);
};

export const detectConcept = (msg) => {
  let best = { key: "general", score: 0 };

  Object.keys(concepts).forEach(k => {
    const score = semanticScore(msg, k);
    if (score > best.score) best = { key: k, score };
  });

  return best;
};