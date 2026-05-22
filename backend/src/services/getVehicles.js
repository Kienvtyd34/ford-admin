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
        let: { modelId: "$_id", variantIds: "$variants._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ["$modelId", "$$modelId"] },
                  { $in: ["$variantId", "$$variantIds"] },
                ],
              },
            },
          },
        ],
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
          $arrayElemAt: [
            {
              $sortArray: {
                input: "$variants",
                sortBy: { basePrice: -1 },
              },
            },
            0,
          ],
        },

        availableCount: { $size: "$inventory" },
      },
    },

    {
      $project: {
        name: 1,
        type: 1,
        seats: 1,
        variants: 1,
        colors: 1,
        bestVariant: 1,
        availableCount: 1,
      },
    },
  ]);
};