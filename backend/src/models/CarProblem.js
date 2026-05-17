import mongoose from "mongoose";

const carProblemSchema = new mongoose.Schema({

  title: {
    type: String,
    required: true
  },

  symptoms: {
    type: [String],
    default: []
  },

  causes: {
    type: [String],
    default: []
  },

  solutions: {
    type: [String],
    default: []
  },

  relatedVehicles: {
    type: [String],
    default: []
  },

  severity: {
    type: String,
    enum: [
      "low",
      "medium",
      "high"
    ],
    default: "medium"
  }

}, { timestamps: true });

export default mongoose.model(
  "CarProblem",
  carProblemSchema
);