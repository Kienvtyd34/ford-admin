import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  variantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Variant', 
    required: true 
  },

  vin: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true 
  },

  engineNumber: String,

  // ✅ FIX: dùng reference
  colorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "VehicleColor" 
  },

  importPrice: Number,

  status: { 
    type: String, 
    enum: ["Trong kho", "Đang lái thử", "Đã đặt cọc", "Đã bán", "Đang bảo trì"],
    default: "Trong kho" 
  },

  category: { 
    type: String, 
    enum: ["Commercial", "Demo"], 
    default: "Commercial" 
  },

  demoDetails: {
    plateNumber: String,
    currentKm: { type: Number, default: 0 },
    lastMaintenanceDate: Date
  },

  importDate: { type: Date, default: Date.now }

}, { timestamps: true });

inventorySchema.index({ variantId: 1 });
inventorySchema.index({ vin: 1 });

export default mongoose.model("Inventory", inventorySchema);