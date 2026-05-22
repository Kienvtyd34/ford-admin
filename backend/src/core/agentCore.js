export const agentCore = async (userId, message) => {
  try {
    const [vehicles, problems] = await Promise.all([
      getVehicleRAG().catch(() => []),
      CarProblem.find().lean().catch(() => []),
    ]);

    // ⚠️ DEBUG QUAN TRỌNG
    if (!Array.isArray(vehicles)) return fallback();
    if (!Array.isArray(problems)) return fallback();

    const techMatch = matchIssue(message, problems);

    // ⚠️ CHẶN FALSE POSITIVE
    const isReallyTechnical =
      techMatch?.issue &&
      detectIntent(message) === "TECHNICAL";

    if (isReallyTechnical) {
      return {
        type: "TECHNICAL",
        reply: buildTechnicalResponse(techMatch.issue),
      };
    }

    const ranked = rankVehicles(message, vehicles);

    if (ranked?.length) {
      return {
        type: "VEHICLE",
        reply: ranked
          .map((v) => buildVehicleResponse(v, getBestVariant(v)))
          .filter(Boolean),
      };
    }

    return fallback();

  } catch (err) {
    console.error("AGENT ERROR:", err);
    return fallback();
  }
};

const fallback = () => ({
  type: "GENERAL",
  reply: "Bạn muốn xe 7 chỗ, SUV hay offroad?",
});