export const semanticAI = async (userId, message) => {
  try {
    const msg = (message || "").toLowerCase();

    const intent = detectIntent(msg);

    await saveMemory(userId, "user", message, intent);

    // ======================
    // VECTOR ONLY FOR UNKNOWN
    // ======================
    let semanticResults = [];

    if (intent === "unknown") {
      semanticResults = (await search(message, 5)) || [];
    }

    // ======================
    // ROUTER (CHATGPT STYLE)
    // ======================

    // PRICE
    if (intent === "price") {
      const models = await VehicleModel.find();

      return {
        message: "💰 Danh sách xe Ford:\n\n" +
          models.map(m => `• ${m.name}`).join("\n")
      };
    }

    // NEWS
    if (intent === "news") {
      const news = await News.find().limit(5);

      return {
        message: "📰 Tin tức Ford:\n\n" +
          news.map(n => `• ${n.title}`).join("\n")
      };
    }

    // PROBLEM
    if (intent === "problem") {
      const problems = await CarProblem.find();

      return {
        message: "⚠️ Lỗi thường gặp:\n\n" +
          problems.map(p => `• ${p.title}`).join("\n")
      };
    }

    // RECOMMEND (SMART CHATGPT STYLE)
    if (intent === "recommend") {
      let variants = await Variant.find().populate("modelId");

      variants = variants.filter(v => v?.modelId);

      // ===== SMART FILTER =====
      if (/7 chỗ|gia đình/.test(msg)) {
        variants = variants.filter(v =>
          ["Everest", "Territory", "Explorer"]
            .some(x => v.modelId.name.includes(x))
        );
      }

      if (/bán tải/.test(msg)) {
        variants = variants.filter(v =>
          ["Ranger", "Raptor"]
            .some(x => v.modelId.name.includes(x))
        );
      }

      const top = variants.slice(0, 5);

      return {
        message: "🚗 Gợi ý xe phù hợp:\n\n" +
          top.map(v => {
            const price = Number(v.basePrice || 0).toLocaleString();
            return `• ${v.modelId.name} ${v.variantName} - ${price} VNĐ`;
          }).join("\n")
      };
    }

    // VECTOR FALLBACK (SAFE)
    if (semanticResults.length > 0) {
      return {
        message: "🔎 Thông tin liên quan:\n\n" +
          semanticResults.map(r => `• ${r.title || r.name}`).join("\n")
      };
    }

    return {
      message:
        "🚗 Tôi có thể tư vấn:\n" +
        "xe gia đình, SUV, bán tải, giá xe, khuyến mãi..."
    };

  } catch (err) {
    console.error("CHATGPT ENGINE ERROR:", err);

    return {
      message: "❌ Hệ thống đang quá tải, vui lòng thử lại sau"
    };
  }
};