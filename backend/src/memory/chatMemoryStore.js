const chatMemory = {};

export const getMemory = (userId) => {
  if (!chatMemory[userId]) {
    chatMemory[userId] = {
      modelName: null,
      variantName: null,
      color: null,
      updatedAt: Date.now()
    };
  }
  return chatMemory[userId];
};

export const updateMemory = (userId, data) => {
  chatMemory[userId] = {
    ...getMemory(userId),
    ...data,
    updatedAt: Date.now()
  };
};