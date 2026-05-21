import Vehicle from "../../models/Vehicle.js";

export const compareEngine = async (aSlug, bSlug) => {

  const [a, b] = await Promise.all([
    Vehicle.findOne({ slug: aSlug }).lean(),
    Vehicle.findOne({ slug: bSlug }).lean()
  ]);

  if (!a || !b) return "Không tìm thấy xe để so sánh";

  return {
    a,
    b
  };
};