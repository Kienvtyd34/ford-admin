import Variant from "../src/models/Variant.js";
import VehicleModel from "../src/models/VehicleModel.js";
import CarProblem from "../src/models/CarProblem.js";
import News from "../src/models/News.js";

import { detectIntent } from "./intent.js";
import { saveMemory } from "./memory.js";
import { search } from "./vectorStore.js";

export const semanticAI = async (userId, message) => {
  try {
    const msg = (message || "").toLowerCase();

    // =====================
    // INPUT SAFETY
    // =====================
    if (!msg.trim()) {
      return { message: "❌ Tin nhắn không hợp lệ" };
    }

    const intent = detectIntent(msg);

    await saveMemory(userId, "user", message, intent);

    // =====================
    // VECTOR SAFE
    // =====================
    let semanticResults = [];

    try {
      if (intent === "unknown") {
        semanticResults = (await search(message, 5)) || [];
      }
    } catch (e) {
      console.error("VECTOR ERROR:", e);
      semanticResults = [];
    }

    // =====================
    // RECOMMEND (SAFE MAX)
    // =====================
    if (intent === "recommend") {
      let variants = [];

      try {
        variants = await Variant.find()
          .populate("modelId")
          .lean();
      } catch (e) {
        console.error("DB ERROR:", e);
        return { message: "❌ Lỗi database, vui lòng thử lại" };
      }

      // =====================
      // HARD CLEAN DATA
      // =====================
      variants = variants.filter(v =>
        v &&
        v.modelId &&
        v.modelId.name &&
        v.basePrice !== undefined
      );

      // =====================
      // FILTER LOGIC SAFE
      // =====================
      if (msg.includes("7 chỗ") || msg.includes("gia đình")) {
        variants = variants.filter(v =>
          ["Everest", "Territory", "Explorer"]
            .some(x => v.modelId.name.includes(x))
        );
      }

      if (msg.includes("bán tải")) {
        variants = variants.filter(v =>
          ["Ranger", "Raptor"]
            .some(x => v.modelId.name.includes(x))
        );
      }

      // =====================
      // LIMIT SAFE
      // =====================
      const top = variants.slice(0, 5);

      return {
        message:
          "🚗 Gợi ý xe phù hợp:\n\n" +
          top.map(v => {
            const name = v.modelId.name || "Unknown";
            const price = Number(v.basePrice || 0).toLocaleString();
            return `• ${name} ${v.variantName || ""} - ${price} VNĐ`;
          }).join("\n")
      };
    }

    // =====================
    // PRICE SAFE
    // =====================
    if (intent === "price") {
      const models = await VehicleModel.find().lean();

      return {
        message:
          "💰 Danh sách xe Ford:\n\n" +
          models.map(m => `• ${m?.name || "Unknown"}`).join("\n")
      };
    }

    // =====================
    // NEWS SAFE
    // =====================
    if (intent === "news") {
      const news = await News.find().limit(5).lean();

      return {
        message:
          "📰 Tin tức:\n\n" +
          news.map(n => `• ${n?.title || "No title"}`).join("\n")
      };
    }

    // =====================
    // PROBLEM SAFE
    // =====================
    if (intent === "problem") {
      const problems = await CarProblem.find().lean();

      return {
        message:
          "⚠️ Lỗi thường gặp:\n\n" +
          problems.map(p => `• ${p?.title || "Unknown"}`).join("\n")
      };
    }

    // =====================
    // VECTOR FALLBACK SAFE
    // =====================
    if (semanticResults.length > 0) {
      return {
        message:
          "🔎 Thông tin liên quan:\n\n" +
          semanticResults.map(r => `• ${r?.title || r?.name || "No data"}`).join("\n")
      };
    }

    // =====================
    // DEFAULT SAFE
    // =====================
    return {
      message:
        "🚗 Tôi có thể hỗ trợ bạn:\n" +
        "- Xe gia đình\n- SUV\n- Bán tải\n- Giá xe\n- Tin tức Ford"
    };

  } catch (err) {
    console.error("🔥 GLOBAL CRASH:", err);

    return {
      message: "❌ Hệ thống đang tạm gián đoạn, vui lòng thử lại"
    };
  }
};