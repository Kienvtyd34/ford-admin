const cacheStore = new Map();

export const setCache = (key, value, ttl = 300000) => {
  cacheStore.set(key, {
    value,
    expire: Date.now() + ttl,
  });
};

export const getCache = (key) => {
  const data = cacheStore.get(key);
  if (!data) return null;

  if (Date.now() > data.expire) {
    cacheStore.delete(key);
    return null;
  }

  return data.value;
};

export const clearCache = () => cacheStore.clear();

export default { setCache, getCache, clearCache };