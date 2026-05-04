import mongoose from "mongoose";

const testDriveSchema = new mongoose.Schema({
  customerName: String,
  phone: String,

  // xe demo được chọn
  inventoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory",
    required: true
  },

  // thời gian khách chọn
  date: Date,
  timeSlot: String, // ví dụ: "08:00 - 10:00"

  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
    default: "Pending"
  }

}, { timestamps: true });

export default mongoose.model("TestDrive", testDriveSchema);