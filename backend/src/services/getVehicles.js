import VehicleModel from "../models/VehicleModel.js";

export const getVehicles = async () => {
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
      },
    },

    {
      $addFields: {
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

    {
      $project: {
        name: 1,
        type: 1,
        seats: 1,
        imageUrl: 1,
        variants: 1,
        colors: 1,
        colorMap: 1,
        inventory: 1,
        bestVariant: 1,
      },
    },
  ]);
};