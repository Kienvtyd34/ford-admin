import mongoose from "mongoose";

const customerVehicleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    licensePlate: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
    },
    vin: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true,
    },
    vehicleModel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleModel",
      default: null,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
      default: null,
    },
    modelName: { type: String, trim: true },
    variantName: { type: String, trim: true },
    color: { type: String, trim: true },
    manufactureYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    currentMileage: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true, maxlength: 1000 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

customerVehicleSchema.index({ user: 1, createdAt: -1 });
customerVehicleSchema.index({ licensePlate: 1 }, { unique: true, sparse: true });
customerVehicleSchema.index({ vin: 1 }, { unique: true, sparse: true });

export default mongoose.model("CustomerVehicle", customerVehicleSchema);
