export const semanticAI = async (userId, message) => {
  try {
    const msg = message.toLowerCase();

    let intent = detectIntent(msg);

    await saveMemory(userId, "user", message, intent);

    // =======================
    // VECTOR SEARCH (ONLY fallback)
    // =======================
    let semanticResults = [];
    if (intent === "unknown") {
      semanticResults = (await search(message, 5)) || [];
    }

    // =======================
    // SMART RECOMMEND ENGINE
    // =======================
    if (intent === "recommend") {
      let variants = await Variant.find().populate("modelId");

      // =======================
      // FILTER LOGIC
      // =======================

      // 7 chỗ / gia đình
      if (msg.includes("7 chỗ") || msg.includes("gia đình")) {
        variants = variants.filter(v =>
          v.modelId?.name?.includes("Everest") ||
          v.modelId?.name?.includes("Territory") ||
          v.modelId?.name?.includes("Explorer")
        );
      }

      // bán tải
      if (msg.includes("bán tải")) {
        variants = variants.filter(v =>
          v.modelId?.name?.includes("Ranger") ||
          v.modelId?.name?.includes("Raptor")
        );
      }

      // SUV
      if (msg.includes("suv")) {
        variants = variants.filter(v =>
          v.modelId?.name?.includes("Everest") ||
          v.modelId?.name?.includes("Territory")
        );
      }

      // mạnh nhất
      if (msg.includes("mạnh nhất")) {
        variants = variants.sort((a, b) => b.basePrice - a.basePrice);
      }

      // =======================
      // LIMIT + SAFE
      // =======================
      const result = variants.slice(0, 5);

      return {
        message:
          "🚗 Gợi ý xe phù hợp:\n\n" +
          result.map(v => {
            const price = Number(v.basePrice || 0).toLocaleString();
            return `• ${v.modelId?.name || "Unknown"} ${v.variantName} - ${price} VNĐ`;
          }).join("\n")
      };
    }

    // =======================
    // PRICE
    // =======================
    if (intent === "price") {
      const models = await VehicleModel.find();

      return {
        message:
          "💰 Danh sách xe Ford:\n\n" +
          models.map(m => `• ${m.name}`).join("\n")
      };
    }

    // =======================
    // PROBLEM
    // =======================
    if (intent === "problem") {
      const problems = await CarProblem.find();

      return {
        message:
          "⚠️ Lỗi thường gặp:\n\n" +
          problems.map(p => `• ${p.title}`).join("\n")
      };
    }

    // =======================
    // NEWS
    // =======================
    if (intent === "news") {
      const news = await News.find().limit(5);

      return {
        message:
          "📰 Tin tức:\n\n" +
          news.map(n => `• ${n.title}`).join("\n")
      };
    }

    // =======================
    // VECTOR FALLBACK
    // =======================
    if (semanticResults.length > 0) {
      return {
        message:
          "🔎 Tôi tìm thấy thông tin liên quan:\n\n" +
          semanticResults.map(r => `• ${r.title || r.name}`).join("\n")
      };
    }

    // =======================
    // DEFAULT
    // =======================
    return {
      message:
        "🚗 Tôi có thể tư vấn:\n" +
        "xe gia đình, SUV, bán tải, giá xe, khuyến mãi..."
    };

  } catch (err) {
    console.error("semanticAI error:", err);

    return {
      message: "❌ Hệ thống đang bận, vui lòng thử lại sau"
    };
  }
};