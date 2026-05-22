import mongoose from "mongoose";

const vehicleColorSchema = new mongoose.Schema({
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variant',
    required: true
  },

  name: { type: String, required: true },

  hexCode: {
    type: String,
    match: /^#([0-9A-F]{3}){1,2}$/i,
    default: null
  },

  // 🔥 ẢNH THEO MÀU + VARIANT
  images: {
    type: [String],
    default: []
  }

}, { timestamps: true });

vehicleColorSchema.index({ variantId: 1 });

export default mongoose.model(
  "VehicleColor",
  vehicleColorSchema,
  "vehiclecolors"
);