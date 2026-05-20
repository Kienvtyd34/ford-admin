import Memory from "../src/models/memory.js";

export const saveMemory = async (
  userId,
  role,
  text
) => {
  if (!userId) return;

  await Memory.updateOne(
    { userId },
    {
      $push: {
        messages: {
          role,
          text,
          time: new Date(),
        },
      },
    },
    { upsert: true }
  );
};

export const getRecentMemory = async (
  userId,
  limit = 5
) => {
  const memory = await Memory.findOne({ userId });

  if (!memory) return [];

  return memory.messages.slice(-limit);
};