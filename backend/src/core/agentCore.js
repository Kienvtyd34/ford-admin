export const agentCore = async (userId, message) => {
  try {
    const [vehicles, problems] = await Promise.all([
      getVehicleRAG(),
      CarProblem.find().lean(),
    ]);

    const techMatch = matchIssue(message, problems);

    if (techMatch?.issue) {
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

    return {
      type: "GENERAL",
      reply: "Bạn muốn xe 7 chỗ, SUV hay offroad?",
    };

  } catch (err) {
    console.error("agentCore crash:", err);
    return {
      type: "ERROR",
      reply: "Hệ thống đang xử lý lỗi, vui lòng thử lại sau",
    };
  }
};