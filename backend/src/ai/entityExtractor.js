export const extractEntities = (message, models) => {
  const msg = message.toLowerCase();

  const entities = {
    models: [],
    type: null,
    seats: null,
    intentHint: null,
  };

  // FIX MODEL MATCH (QUAN TRỌNG)
  entities.models = models.filter((m) => {
    const name = m.name.toLowerCase();

    return msg.includes(name);
  });

  if (msg.includes("7 chỗ")) entities.seats = 7;
  if (msg.includes("5 chỗ")) entities.seats = 5;

  if (msg.includes("suv")) entities.type = "SUV";
  if (msg.includes("bán tải")) entities.type = "Pick-up";

  return entities;
};