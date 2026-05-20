import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
  userId: { type: String, index: true },

  messages: [
    {
      role: String,
      text: String,
      intent: String,
      time: { type: Date, default: Date.now }
    }
  ]
});

const Memory = mongoose.model("Memory", memorySchema);

export default Memory;

// =====================
// SAVE MEMORY
// =====================
import { embedText } from "../../ai/embedding.js";

export const saveMemory = async (userId, role, text, intent = null) => {
  try {
    const vector = await embedText(text);

    await Memory.updateOne(
      { userId },
      {
        $push: {
          messages: {
            role,
            text,
            intent,
            vector, // 🔥 quan trọng
            time: new Date(),
          },
        },
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("MEMORY ERROR:", err);
  }
};

// =====================
// GET MEMORY
// =====================
export const getMemory = async (userId) => {
  try {
    return await Memory.findOne({ userId });
  } catch (err) {
    console.error("GET MEMORY ERROR:", err);
    return null;
  }
};