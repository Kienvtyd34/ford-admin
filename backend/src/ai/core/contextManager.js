const store = new Map();

export const saveContext = (userId, data) => {
  store.set(userId, {
    ...store.get(userId),
    ...data,
    updatedAt: Date.now(),
  });
};

export const getContext = (userId) => {
  const data = store.get(userId);
  if (!data) return null;

  if (Date.now() - data.updatedAt > 30 * 60 * 1000) {
    store.delete(userId);
    return null;
  }

  return data;
};

export default { saveContext, getContext };