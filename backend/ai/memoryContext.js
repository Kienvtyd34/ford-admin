import Memory from "../src/models/memory.js";

/**
 * Lấy context gần nhất (ChatGPT-style short-term memory)
 */
export const getRecentContext = async (userId, limit = 10) => {
  const memory = await Memory.findOne({ userId });

  if (!memory) return [];

  return memory.messages
    .slice(-limit)
    .map((m) => ({
      role: m.role,
      text: m.text,
      intent: m.intent,
    }));
};