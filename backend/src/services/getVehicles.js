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
        let: { variantIds: "$variants._id" },
        pipeline: [
          {
            $match: {
              $expr: { $in: ["$variantId", "$$variantIds"] },
            },
          },
        ],
        as: "colors",
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
      },
    },
  ]);
};