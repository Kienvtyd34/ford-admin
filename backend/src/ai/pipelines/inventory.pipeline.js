import Inventory from "../../models/Inventory.js";

export default async () => {
  try {
    const data = await Inventory.find({ status: "Trong kho" })
      .populate({
        path: "variantId",
        populate: "modelId",
      });

    return {
      intent: "INVENTORY",
      message: `📦 Có ${data.length} xe trong kho sẵn giao ngay`,
    };
  } catch (err) {
    return {
      intent: "INVENTORY",
      message: "⚠️ Không thể lấy dữ liệu kho xe",
    };
  }
};