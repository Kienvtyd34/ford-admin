import mongoose from "mongoose";

const technicalIssueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    symptoms: [
      {
        type: String,
      },
    ],

    causes: [
      {
        type: String,
      },
    ],

    solutions: [
      {
        type: String,
      },
    ],

    relatedVehicles: [
      {
        type: String,
      },
    ],

    severity: {
      type: String,
      enum: [
        "low",
        "medium",
        "high",
      ],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "TechnicalIssue",
  technicalIssueSchema
);