export const planner = async ({
  message,
  context,
  entities
}) => {

  const text = message.toLowerCase();

  // hỏi xe
  if (
    text.includes("xe") ||
    text.includes("ford") ||
    entities.vehicle
  ) {

    return {
      intent: "vehicle_info"
    };
  }

  return {
    intent: "chat"
  };
};