import mongoose from "mongoose";

const servicePackageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 2000 },
    category: { type: String, required: true, trim: true, maxlength: 100 },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, required: true, min: 15 },
    isActive: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

servicePackageSchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model("ServicePackage", servicePackageSchema);
