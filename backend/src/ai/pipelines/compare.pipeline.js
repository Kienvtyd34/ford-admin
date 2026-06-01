export default async (entities) => {
  return {
    intent: "COMPARE",
    message: "⚔️ So sánh xe đang được xử lý...",
    data: entities,
  };
};