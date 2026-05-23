const sessions = new Map();

export const saveContext = (userId, data) => {
  sessions.set(userId, {
    ...data,
    updatedAt: Date.now(),
  });
};

export const getContext = (userId) => {
  const data = sessions.get(userId);

  if (!data) return null;

  const expired = Date.now() - data.updatedAt > 1000 * 60 * 30;

  if (expired) {
    sessions.delete(userId);
    return null;
  }

  return data;
};

export default {
  saveContext,
  getContext,
};