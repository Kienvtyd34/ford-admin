import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  modelId: { type: mongoose.Schema.Types.ObjectId, ref: 'VehicleModel', required: true },
  variantName: { type: String, required: true }, // VD: Titanium+, Sport, Wildtrak
  basePrice: { type: Number, required: true },
  transmission: String, // Số sàn / Tự động
  driveTrain: String,   // 4x2 / 4x4
  fuelType: String
}, { timestamps: true });

variantSchema.index({ modelId: 1 });


export default mongoose.model("Variant", variantSchema, "variants");