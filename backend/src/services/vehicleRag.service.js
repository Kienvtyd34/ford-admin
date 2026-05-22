import VehicleModel from "../models/VehicleModel.js";

export const getVehicleRAG = async () => {
  return VehicleModel.aggregate([
    {
      $lookup: {
        from: "vehiclevariants",
        localField: "_id",
        foreignField: "modelId",
        as: "variants",
      },
    },
    {
      $lookup: {
        from: "vehiclecolors",
        localField: "variants._id",
        foreignField: "variantId",
        as: "colors",
      },
    },
    {
      $lookup: {
        from: "inventories",
        localField: "variants._id",
        foreignField: "variantId",
        as: "inventory",
      },
    },
    {
      $addFields: {
        variants: { $ifNull: ["$variants", []] },
        colors: { $ifNull: ["$colors", []] },
        inventory: { $ifNull: ["$inventory", []] },

        bestVariant: {
          $let: {
            vars: {
              sorted: {
                $sortArray: {
                  input: { $ifNull: ["$variants", []] },
                  sortBy: { basePrice: -1 },
                },
              },
            },
            in: { $arrayElemAt: ["$$sorted", 0] },
          },
        },
      },
    },
  ]);
};