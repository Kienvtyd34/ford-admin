const memoryStore = {};

export const saveMemory = (
  userId,
  data
) => {
  memoryStore[userId] = {
    ...memoryStore[userId],
    ...data,
  };
};

export const getMemory = (
  userId
) => {
  return memoryStore[userId] || {};
};