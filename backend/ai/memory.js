import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
  userId: String,
  messages: [
    {
      role: String, // user | bot
      text: String,
      intent: String,
      time: { type: Date, default: Date.now }
    }
  ]
});

export default mongoose.model("Memory", memorySchema);

export const saveMemory = async (userId, role, text, intent = null) => {
  await Memory.updateOne(
    { userId },
    {
      $push: {
        messages: { role, text, intent }
      }
    },
    { upsert: true }
  );
};

export const getMemory = async (userId) => {
  return await Memory.findOne({ userId });
};