const sessions = new Map();

export const saveContext = (userId, data) => {
  const old = sessions.get(userId) || {};

  sessions.set(userId, {
    ...old,
    ...data,
    updatedAt: Date.now(),
    history: [...(old.history || []), data.intent].slice(-15),
  });
};

export const getContext = (userId) => {
  const data = sessions.get(userId);
  if (!data) return null;

  if (Date.now() - data.updatedAt > 45 * 60 * 1000) {
    sessions.delete(userId);
    return null;
  }

  return data;
};

export default { saveContext, getContext };