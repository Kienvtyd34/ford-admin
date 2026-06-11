import Inventory from "../models/Inventory.js";

export const getStockByVariant = async (variantId) => {
  const items = await Inventory.find({
    variantId,
    status: "Trong kho"
  });

  return {
    count: items.length,
    items
  };
};

export const getColorsByVariant = async (variantId) => {
  const items = await Inventory.find({
    variantId,
    status: "Trong kho"
  }).populate("colorId");

  const colors = new Map();

  items.forEach(i => {
    if (i.colorId) {
      colors.set(i.colorId.name, i.colorId);
    }
  });

  return [...colors.values()];
};