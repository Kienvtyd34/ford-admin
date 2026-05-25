import Inventory from "../../models/Inventory.js";

export const findInventory = async (
  entities
) => {
  const inventories =
    await Inventory.find({
      status: "Trong kho",
    })
      .populate({
        path: "variantId",
        populate: {
          path: "modelId",
        },
      })
      .populate("colorId");

  return inventories.filter((item) => {
    const model =
      item.variantId?.modelId;

    const color = item.colorId;

    let matched = true;

    if (entities.model) {
      matched =
        matched &&
        model?.name
          ?.toLowerCase()
          .includes(
            entities.model.name.toLowerCase()
          );
    }

    if (entities.color) {
      matched =
        matched &&
        color?.name
          ?.toLowerCase()
          .includes(
            entities.color.name.toLowerCase()
          );
    }

    return matched;
  });
};
