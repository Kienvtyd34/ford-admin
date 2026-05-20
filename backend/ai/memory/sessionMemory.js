const sessions = new Map();

export const saveConversationContext = (
  userId,
  data
) => {

  const current =
    sessions.get(userId) || {};

  sessions.set(userId, {
    ...current,
    ...data,
  });
};

export const getConversationContext = (
  userId
) => {

  return (
    sessions.get(userId) || {}
  );
};