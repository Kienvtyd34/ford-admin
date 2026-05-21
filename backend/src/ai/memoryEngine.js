// src/ai/memoryEngine.js

const memoryStore = {};

export const saveMemory = (
  userId,
  entities
) => {

  if (!memoryStore[userId]) {
    memoryStore[userId] = [];
  }

  memoryStore[userId].push({
    time: Date.now(),
    entities,
  });
};

export const getMemory = (
  userId
) => {

  return (
    memoryStore[userId] || []
  );
};