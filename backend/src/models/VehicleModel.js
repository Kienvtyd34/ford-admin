import mongoose from "mongoose";

const vehicleModelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    brand: { type: String, default: "Ford" },

    type: {
      type: String,
      enum: ["SUV", "Sedan", "Pick-up", "Van"],
      required: true,
    },

    seats: Number,

    images: {
      type: [String],
      default: [],
    },

    imageUrl: { type: String, required: true },

    description: String,

    isHot: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model(
  "VehicleModel",
  vehicleModelSchema,
  "vehiclemodels"
);