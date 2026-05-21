const sessions = new Map();

export const getConversationContext = (userId) => {
  return sessions.get(userId) || {};
};

export const saveConversationContext = (userId, data) => {
  const old = sessions.get(userId) || {};
  sessions.set(userId, { ...old, ...data });
};