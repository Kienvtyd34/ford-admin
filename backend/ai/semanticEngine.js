import VehicleModel from "../src/models/VehicleModel.js";
import Variant from "../src/models/Variant.js";
import CarProblem from "../src/models/CarProblem.js";
import News from "../src/models/News.js";

import { detectIntent } from "./intent.js";
import { saveMemory } from "./memory.js";
import { search } from "./vectorStore.js";

export const semanticAI = async (userId, message) => {
  try {
    if (!message || typeof message !== "string") {
      return {
        message: "❌ Tin nhắn không hợp lệ"
      };
    }

    // =======================
    // INTENT DETECTION (SAFE)
    // =======================
    let intent = "unknown";
    try {
      intent = detectIntent(message);
    } catch (err) {
      console.error("detectIntent error:", err);
    }

    // =======================
    // MEMORY
    // =======================
    try {
      await saveMemory(userId, "user", message, intent);
    } catch (err) {
      console.error("saveMemory error:", err);
    }

    // =======================
    // VECTOR SEARCH (SAFE)
    // =======================
    let semanticResults = [];
    try {
      semanticResults = (await search(message, 5)) || [];
    } catch (err) {
      console.error("vector search error:", err);
    }

    // =======================
    // RECOMMEND
    // =======================
    if (intent === "recommend") {
      const variants = await Variant.find().populate("modelId");

      const result = variants
        .filter(v => v.basePrice && v.basePrice <= 1000000000)
        .slice(0, 5);

      return {
        message:
          "🚗 Gợi ý xe phù hợp:\n\n" +
          result
            .map(v => {
              const price = Number(v.basePrice || 0).toLocaleString();
              return `• ${v.modelId?.name || "Unknown"} ${v.variantName} - ${price} VNĐ`;
            })
            .join("\n")
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
          semanticResults
            .map(r => `• ${r.title || r.name || "Không rõ tiêu đề"}`)
            .join("\n")
      };
    }

    // =======================
    // DEFAULT RESPONSE
    // =======================
    return {
      message:
        "🚗 Tôi có thể tư vấn xe Ford:\n" +
        "giá xe, dòng SUV, lỗi thường gặp, tin tức, khuyến mãi..."
    };

  } catch (err) {
    console.error("semanticAI CRASH:", err);

    return {
      message: "❌ Hệ thống đang quá tải, vui lòng thử lại sau"
    };
  }
};