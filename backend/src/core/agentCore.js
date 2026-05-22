export const agentCore = async (userId, message) => {
  const [vehicles, problems] = await Promise.all([
    getVehicleRAG(),
    CarProblem.find().lean(),
  ]);

  const intent = detectIntent(message);

  // 🔥 1. TECHNICAL FIRST (FIX BUG CHÍNH)
  const techMatch = matchIssue(message, problems);

  if (techMatch?.issue) {
    return {
      type: "TECHNICAL",
      reply: buildTechnicalResponse(techMatch.issue),
    };
  }

  // 2. VEHICLE
  const ranked = rankVehicles(message, vehicles);

  if (ranked.length > 0) {
    return {
      type: "VEHICLE",
      reply: ranked.map((v) =>
        buildVehicleResponse(v, getBestVariant(v))
      ),
    };
  }

  return {
    type: "GENERAL",
    reply: "Bạn muốn xe 7 chỗ, SUV hay offroad?",
  };
};