const memoryDB = new Map();

export const getSession = (id) => {
  if (!memoryDB.has(id)) {
    memoryDB.set(id, {
      messages: [],
      profile: {
        budget: null,
        interest: [],
        lastIntent: null
      }
    });
  }
  return memoryDB.get(id);
};

export const addMessage = (id, role, text) => {
  const session = getSession(id);

  session.messages.push({ role, text, time: Date.now() });

  if (session.messages.length > 30) {
    session.messages.shift();
  }
};