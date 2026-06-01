import Inventory from "../../models/Inventory.js";

export default async () => {
  const data = await Inventory.find({ status: "Trong kho" })
    .populate({ path: "variantId", populate: "modelId" });

  return {
    intent: "INVENTORY",
    message: `📦 Có ${data.length} xe trong kho`,
  };
};