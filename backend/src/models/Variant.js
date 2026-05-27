import mongoose from "mongoose";

const variantSchema =
  new mongoose.Schema(
    {
      modelId: {
        type:
          mongoose.Schema.Types.ObjectId,

        ref: "VehicleModel",

        required: true,
      },

      variantName: {
        type: String,
        required: true,
      },

      aliases: [String],

      basePrice: {
        type: Number,
        required: true,
      },

      transmission: String,

      driveTrain: String,

      fuelType: String,

      specs: {
        engine: String,

        horsepower: Number,

        torque: Number,

        fuelConsumption: String,
      },

      features: {
        adas: Boolean,

        turbo: Boolean,

        camera360: Boolean,

        sunroof: Boolean,

        abs: Boolean,
      },

      isHot: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    }
  );

export default mongoose.model(
  "Variant",
  variantSchema,
  "variants"
);