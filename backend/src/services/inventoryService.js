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