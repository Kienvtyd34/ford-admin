const memoryStore = new Map();

export const saveConversationContext = (
  userId,
  data
) => {

  const old =
    memoryStore.get(userId) || {};

  memoryStore.set(userId, {
    ...old,
    ...data,
  });
};

export const getConversationContext = (
  userId
) => {

  return (
    memoryStore.get(userId) || {}
  );
};