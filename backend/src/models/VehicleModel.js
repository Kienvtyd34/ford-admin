import mongoose from "mongoose";

const vehicleModelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true },
  brand: { type: String, default: "Ford" },
  type: { type: String, enum: ["SUV", "Sedan", "Pick-up", "Van"], required: true },
  seats: Number,
  imageUrl: { type: String, required: true }, // Ảnh đại diện chính
  specs: {
    engine: String,
    fuelType: String,
    wheel: String
  },
  description: String, // Bài viết giới thiệu xe
  isHot: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("VehicleModel", vehicleModelSchema);