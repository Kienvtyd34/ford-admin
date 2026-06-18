import mongoose from "mongoose";

const intentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },

  label: {
    type: String
  },

  keywords: [
    {
      type: String
    }
  ],

  weight: {
    type: Number,
    default: 1
  },

  priorityBoost: {
    type: Number,
    default: 0
  },

  description: String,

  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("Intent", intentSchema);