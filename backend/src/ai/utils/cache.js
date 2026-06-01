const cache = new Map();

export const set = (k, v, ttl = 300000) =>
  cache.set(k, { v, e: Date.now() + ttl });

export const get = (k) => {
  const d = cache.get(k);
  if (!d) return null;
  if (Date.now() > d.e) return null;
  return d.v;
};

export default { set, get };