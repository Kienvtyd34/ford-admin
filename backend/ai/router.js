import VehicleModel from "../src/models/VehicleModel.js";
import Variant from "../src/models/Variant.js";
import CarProblem from "../src/models/CarProblem.js";
import News from "../src/models/News.js";

import { saveMemory } from "../src/models/memory.js";
import { search } from "./search.js";
import { detectIntent } from "./intent.js";

// =====================
// CLASSIFY
// =====================
const classifyIntent = (msg, results = []) => {
  const text = msg.toLowerCase();

  const topScore = results?.[0]?.score ?? 999;

  if (/(giá|bao nhiêu)/.test(text)) return "price";
  if (/(tin)/.test(text)) return "news";
  if (/(lỗi|hỏng)/.test(text)) return "problem";

  if (topScore < 0.4) return "recommend";

  return detectIntent(text);
};

// =====================
// MAIN AI
// =====================
export const semanticAI = async (userId, message) => {
  try {
    const msg = message.toLowerCase();

    // VECTOR SEARCH
    const semanticResults = search(message, 5);

    // INTENT
    const intent = classifyIntent(msg, semanticResults);

    await saveMemory(userId, "user", message, intent);

    // =====================
    // RECOMMEND
    // =====================
    if (intent === "recommend") {
      const variants = await Variant.find().populate("modelId").lean();

      const ranked = variants
        .map(v => {
          const match = semanticResults.find(r =>
            r?.name === v?.modelId?.name
          );

          return {
            ...v,
            score: match?.score ?? 999
          };
        })
        .sort((a, b) => a.score - b.score)
        .slice(0, 5);

      return {
        message:
          "🚗 Gợi ý xe phù hợp:\n\n" +
          ranked.map(v =>
            `• ${v.modelId.name} (${v.modelId.seats} chỗ) - ${Number(v.basePrice).toLocaleString()} VNĐ`
          ).join("\n")
      };
    }

    // =====================
    // PRICE
    // =====================
    if (intent === "price") {
  const models = await VehicleModel.find().lean();

  return {
    message:
      "💰 Giá xe Ford:\n\n" +
      models.map(m =>
        `• ${m.name} - ${Number(m.basePrice || m.price || 0).toLocaleString()} VNĐ`
      ).join("\n")
  };
}

    // =====================
    // NEWS
    // =====================
    if (intent === "news") {
      const news = await News.find().limit(5).lean();

      return {
        message:
          "📰 Tin tức Ford:\n\n" +
          news.map(n => `• ${n.title}`).join("\n")
      };
    }

    // =====================
    // PROBLEM
    // =====================
    if (intent === "problem") {
      const problems = await CarProblem.find().lean();

      return {
        message:
          "⚠️ Lỗi thường gặp:\n\n" +
          problems.map(p => `• ${p.title}`).join("\n")
      };
    }

    // =====================
    // FALLBACK
    // =====================
    if (semanticResults.length > 0) {
      return {
        message:
          "🔎 Tôi hiểu bạn đang quan tâm:\n\n" +
          semanticResults.slice(0, 5)
            .map(r => `• ${r.name || r.title}`)
            .join("\n")
      };
    }

    return {
      message:
        "🚗 Tôi có thể giúp bạn chọn xe Ford (gia đình, SUV, bán tải, giá xe)."
    };

  } catch (err) {
    console.error("AI ERROR:", err);

    return {
      message: "❌ Hệ thống tạm gián đoạn, vui lòng thử lại"
    };
  }
};