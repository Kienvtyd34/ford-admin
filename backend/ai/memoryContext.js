import Memory from "../src/models/memory.js";

export const getRecentContext = async (userId, limit = 5) => {
  const memory = await Memory.findOne({ userId });

  if (!memory) return [];

  return memory.messages.slice(-limit).map((m) => ({
    role: m.role,
    text: m.text,
    intent: m.intent,
  }));
};