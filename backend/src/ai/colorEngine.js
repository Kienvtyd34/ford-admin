import VehicleColor from "../models/VehicleColor.js";

export const getColorsByVariant = async (variantId) => {
  const colors = await VehicleColor.find({ variantId }).lean();

  return colors.map((c) => ({
    name: c.name,
    hexCode: c.hexCode,
    images: c.images || [],
  }));
};

export const getColorsByModel = async (variants) => {
  const ids = variants.map((v) => v._id);

  const colors = await VehicleColor.find({
    variantId: { $in: ids },
  }).lean();

  return colors.map((c) => ({
    name: c.name,
    hexCode: c.hexCode,
  }));
};