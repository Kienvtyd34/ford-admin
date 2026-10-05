import mongoose from "mongoose";

const ACTIVE_APPOINTMENT_STATUSES = [
  "Held",
  "AwaitingPayment",
  "Confirmed",
  "InService",
];

const serviceAppointmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    customerVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CustomerVehicle",
      required: true,
      index: true,
    },
    servicePackage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServicePackage",
      required: true,
    },
    serviceDate: { type: Date, required: true },
    timeSlot: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: [
        "Held",
        "AwaitingPayment",
        "Confirmed",
        "InService",
        "Completed",
        "Cancelled",
        "Expired",
      ],
      default: "Held",
      index: true,
    },
    holdExpiresAt: { type: Date, required: true, index: true },
    notes: { type: String, trim: true, maxlength: 2000 },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    confirmedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

serviceAppointmentSchema.index({ serviceDate: 1, timeSlot: 1, status: 1 });
serviceAppointmentSchema.index(
  { serviceDate: 1, timeSlot: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ACTIVE_APPOINTMENT_STATUSES },
    },
  }
);

export { ACTIVE_APPOINTMENT_STATUSES };
export default mongoose.model("ServiceAppointment", serviceAppointmentSchema);
