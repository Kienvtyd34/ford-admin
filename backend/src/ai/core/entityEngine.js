const normalize = (s) =>
  s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

export const entityEngine = async (message) => {
  const text = normalize(message);

  const models = await VehicleModel.find();

  const out = {
    model: null,
    variant: null,
    budget: null,
    seats: null,
  };

  // 🔥 FIX MODEL MATCH STRONG
  for (const m of models) {
    const names = [m.name, ...(m.aliases || [])];

    if (names.some(n => text.includes(normalize(n)))) {
      out.model = m;
      break;
    }
  }

  const variants = await Variant.find().populate("modelId");

  for (const v of variants) {
    const names = [v.variantName, ...(v.aliases || [])];

    if (names.some(n => text.includes(normalize(n)))) {
      out.variant = v;
      out.model = v.modelId;
      break;
    }
  }

  if (text.includes("7 cho")) out.seats = 7;
  if (text.includes("5 cho")) out.seats = 5;

  const budget = text.match(/(\d+)\s*(ty|trieu)/i);
  if (budget) {
    let val = Number(budget[1]);
    if (budget[2] === "ty") val *= 1e9;
    if (budget[2] === "trieu") val *= 1e6;
    out.budget = val;
  }

  return out;
};

export default entityEngine;