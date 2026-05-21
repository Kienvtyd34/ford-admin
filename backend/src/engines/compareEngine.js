import Vehicle from "../models/VehicleModel.js";

export const compareEngine = async (aSlug, bSlug) => {
  const [a, b] = await Promise.all([
    Vehicle.findOne({ slug: aSlug }).lean(),
    Vehicle.findOne({ slug: bSlug }).lean()
  ]);

  if (!a || !b) return null;

  return { a, b };
};