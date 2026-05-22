// /rag/vehicleRag.js
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
        bestVariant: {
          $first: {
            $sortArray: {
              input: "$variants",
              sortBy: { basePrice: -1 },
            },
          },
        },

        colorMap: {
          $map: {
            input: "$colors",
            as: "c",
            in: {
              name: "$$c.name",
              hexCode: "$$c.hexCode",
              variantId: "$$c.variantId",
              images: "$$c.images",
            },
          },
        },
      },
    },
  ]);
};