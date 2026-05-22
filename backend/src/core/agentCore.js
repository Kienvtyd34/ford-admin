export const agentCore = async (userId, message) => {
  try {
    const [vehicles, problems] = await Promise.all([
      getVehicleRAG(),
      CarProblem.find().lean(),
    ]);

    const intent = detectIntent(message);
    const techMatch = matchIssue(message, problems);

    // =========================
    // 1. TECHNICAL PRIORITY
    // =========================
    if (techMatch?.issue) {
      return {
        type: "TECHNICAL",
        reply: buildTechnicalResponse(techMatch.issue),
      };
    }

    // =========================
    // 2. VEHICLE LOGIC (CHỈ KHI KHÔNG TECH)
    // =========================
    const ranked = rankVehicles(message, vehicles);

    if (ranked?.length) {
      return {
        type: "VEHICLE",
        reply: ranked
          .slice(0, 3)
          .map((v) =>
            buildVehicleResponse(v, getBestVariant(v))
          )
          .join("\n\n"),
      };
    }

    // =========================
    // 3. INTENT FALLBACK (QUAN TRỌNG)
    // =========================
    if (intent === "FAMILY") {
      return {
        type: "GENERAL",
        reply: "Bạn muốn xe 7 chỗ SUV hay MPV?",
      };
    }

    if (intent === "OFFROAD") {
      return {
        type: "GENERAL",
        reply: "Bạn cần bán tải hay SUV địa hình?",
      };
    }

    return {
      type: "GENERAL",
      reply: "Bạn muốn xe 7 chỗ, SUV hay offroad?",
    };
  } catch (err) {
    console.error("agentCore error:", err);

    return {
      type: "ERROR",
      reply: "Hệ thống đang xử lý lỗi, vui lòng thử lại sau",
    };
  }
};