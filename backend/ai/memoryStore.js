const memoryDB = new Map();

export const saveMemory = (userId, message, intent) => {
  if (!memoryDB.has(userId)) {
    memoryDB.set(userId, { history: [] });
  }

  const mem = memoryDB.get(userId);

  mem.history.push({
    message,
    intent,
    time: Date.now()
  });

  if (mem.history.length > 10) {
    mem.history.shift();
  }

  memoryDB.set(userId, mem);
};

export const getMemory = (userId) => {
  return memoryDB.get(userId) || { history: [] };
};