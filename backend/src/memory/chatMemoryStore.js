const chatMemory = {};

export const getMemory = (userId) => {
  return chatMemory[userId] || {};
};

export const updateMemory = (userId, data) => {
  chatMemory[userId] = {
    ...(chatMemory[userId] || {}),
    ...data,
    updatedAt: Date.now()
  };
};

export const clearMemory = (userId) => {
  delete chatMemory[userId];
};