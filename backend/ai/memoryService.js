import Memory from "../src/models/memory.js";
import { embedText } from "./embedding.js";

// ===================== SAVE MEMORY =====================
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
            vector,
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

// ===================== GET MEMORY =====================
export const getMemory = async (userId) => {
  return await Memory.findOne({ userId });
};