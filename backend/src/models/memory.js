import mongoose from "mongoose";

// =====================
// MODEL
// =====================
const memorySchema = new mongoose.Schema({
  userId: String,
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
// SERVICE FUNCTIONS
// =====================
export const saveMemory = async (userId, role, text, intent = null) => {
  try {
    return await Memory.updateOne(
      { userId },
      {
        $push: {
          messages: {
            role,
            text,
            intent,
            time: new Date()
          }
        }
      },
      { upsert: true }
    );
  } catch (err) {
    console.error("MEMORY ERROR:", err);
  }
};

export const getMemory = async (userId) => {
  try {
    return await Memory.findOne({ userId });
  } catch (err) {
    console.error("GET MEMORY ERROR:", err);
    return null;
  }
};