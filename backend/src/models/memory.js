import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
  userId: { type: String, index: true },

  messages: [
    {
      role: String,
      text: String,
      intent: String,
      vector: { type: [Number] }, // ✅ FIX CRITICAL
      time: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("Memory", memorySchema);