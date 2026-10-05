import mongoose from "mongoose";

const servicePaymentSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceAppointment",
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 1 },
    transferCode: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Expired", "Refunded"],
      default: "Pending",
      index: true,
    },
    sepayTransactionId: { type: String, unique: true, sparse: true, index: true },
    providerPayload: { type: mongoose.Schema.Types.Mixed, default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

servicePaymentSchema.index({ appointment: 1, status: 1 });

export default mongoose.model("ServicePayment", servicePaymentSchema);
