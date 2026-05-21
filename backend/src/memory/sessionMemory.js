export const getConversationContext = async (redis, userId) => {
  const data = await redis.get(`session:${userId}`);
  return data ? JSON.parse(data) : {};
};

export const saveConversationContext = async (redis, userId, data) => {
  const old = await getConversationContext(redis, userId);

  const merged = {
    ...old,
    history: [...(old.history || []), data].slice(-10)
  };

  await redis.set(
    `session:${userId}`,
    JSON.stringify(merged),
    { EX: 60 * 60 * 24 }
  );
};