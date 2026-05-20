const sessions = new Map();

export const saveConversationContext = (
  userId,
  data
) => {
  const old =
    sessions.get(userId) || {};

  sessions.set(userId, {
    ...old,
    ...data,
    updatedAt: Date.now(),
  });
};

export const getConversationContext = (
  userId
) => {
  return (
    sessions.get(userId) || {}
  );
};