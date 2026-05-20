export const salesReasoning = (query, brainResults) => {
  const text = query.toLowerCase();

  const hasFamily = text.includes("gia đình") || text.includes("7 chỗ");
  const hasBudget = text.match(/\d+/);

  const topModels = brainResults.filter(r => r.type === "model");

  let recommendation = topModels[0]?.raw || null;

  if (hasFamily) {
    recommendation = topModels.find(m => m.raw.seats >= 7) || recommendation;
  }

  return {
    recommendation,
    results: brainResults.slice(0, 5),
  };
};