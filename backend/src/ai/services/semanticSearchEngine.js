import Variant from "../../models/Variant.js";

export const semanticVehicleSearch = async (message) => {
  const text = message.toLowerCase();

  const variants = await Variant.find().populate("modelId");

  return variants
    .map(v => {
      let score = 0;

      if (text.includes(v.modelId?.name?.toLowerCase())) score += 5;
      if (text.includes("7 cho") && v.specs?.seats === 7) score += 3;
      if (text.includes("re")) score += v.basePrice < 1e9 ? 2 : 0;

      return { variant: v, score };
    })
    .filter(v => v.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
};