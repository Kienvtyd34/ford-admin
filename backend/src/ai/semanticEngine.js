const norm = (t = "") =>
  t.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

const SCORE_RULES = [
  { key: "everest", weight: 5 },
  { key: "ranger", weight: 5 },
  { key: "territory", weight: 4 },
  { key: "suv", weight: 2 },
  { key: "pickup", weight: 3 },
  { key: "7 chỗ", weight: 3 },
  { key: "gia đình", weight: 3 },
  { key: "offroad", weight: 4 },
];

export const rankVehicles = (message, vehicles) => {
  const msg = norm(message);

  return vehicles
    .map((v) => {
      let score = 0;

      const name = norm(v.name);
      const type = norm(v.type);

      if (msg.includes(name)) score += 10;
      if (msg.includes(type)) score += 3;

      SCORE_RULES.forEach((r) => {
        if (msg.includes(r.key)) score += r.weight;
      });

      return { ...v, score };
    })
    .sort((a, b) => b.score - a.score);
};