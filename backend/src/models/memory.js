import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
  userId: { type: String, index: true },

  messages: [
    {
      role: String,
      text: String,
      intent: String,
      vector: { type: [Number] },
      time: { type: Date, default: Date.now },
    },
  ],
});

const Memory = mongoose.model("Memory", memorySchema);

export default Memory;