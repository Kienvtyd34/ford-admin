import VehicleModel from "../src/models/VehicleModel.js";
import Variant from "../src/models/Variant.js";
import CarProblem from "../src/models/CarProblem.js";
import News from "../src/models/News.js";

import { saveMemory } from "./memory.js";
import { search } from "./vectorStore.js";

const classifyIntent = (msg, results = []) => {
  const text = msg.toLowerCase();

  // semantic boost từ vector
  const topScore = results?.[0]?.score || 999;

  if (text.includes("giá") || text.includes("bao nhiêu")) return "price";
  if (text.includes("tin")) return "news";
  if (text.includes("lỗi") || text.includes("hỏng")) return "problem";

  // SEMANTIC RULE (QUAN TRỌNG)
  if (topScore < 0.35) return "recommend";

  return "smart";
};

export const semanticAI = async (userId, message) => {
  try {
    const msg = message.toLowerCase();

    // 🔥 1. VECTOR SEARCH (AI CORE)
    const semanticResults = search(message, 5) || [];

    // 🔥 2. INTENT AI (hybrid rule + semantic)
    const intent = classifyIntent(msg, semanticResults);

    await saveMemory(userId, "user", message, intent);

    // ======================
    // SMART RECOMMEND (GPT STYLE)
    // ======================
    if (intent === "recommend") {
      const variants = await Variant.find()
        .populate("modelId")
        .lean();

      const ranked = variants
        .map(v => {
          const name = v.modelId?.name || "";
          const matchScore = semanticResults.find(r =>
            r.modelId?.name === name
          )?.score || 1;

          return {
            ...v,
            score: matchScore
          };
        })
        .sort((a, b) => a.score - b.score)
        .slice(0, 5);

      return {
        message:
          "🚗 Tôi gợi ý cho bạn:\n\n" +
          ranked.map(v => {
            return `• ${v.modelId.name} (${v.modelId.seats} chỗ) - ${Number(v.basePrice).toLocaleString()} VNĐ`;
          }).join("\n")
      };
    }

    // ======================
    // PRICE (SMART FILTER)
    // ======================
    if (intent === "price") {
      const models = await VehicleModel.find().lean();

      const matched = models.filter(m =>
        msg.includes(m.name.toLowerCase())
      );

      const data = matched.length ? matched : models;

      return {
        message:
          "💰 Giá xe Ford:\n\n" +
          data.map(m =>
            `• ${m.name} - ${(m.price || 0).toLocaleString()} VNĐ`
          ).join("\n")
      };
    }

    // ======================
    // NEWS
    // ======================
    if (intent === "news") {
      const news = await News.find().limit(5).lean();

      return {
        message:
          "📰 Tin tức Ford:\n\n" +
          news.map(n => `• ${n.title}`).join("\n")
      };
    }

    // ======================
    // PROBLEM
    // ======================
    if (intent === "problem") {
      const problems = await CarProblem.find().lean();

      return {
        message:
          "⚠️ Lỗi thường gặp:\n\n" +
          problems.map(p => `• ${p.title}`).join("\n")
      };
    }

    // ======================
    // GPT FALLBACK (SEMANIC)
    // ======================
    if (semanticResults.length > 0) {
      return {
        message:
          "🔎 Tôi hiểu bạn đang quan tâm:\n\n" +
          semanticResults
            .slice(0, 5)
            .map(r => `• ${r.title || r.name}`)
            .join("\n")
      };
    }

    // ======================
    // FINAL GPT STYLE
    // ======================
    return {
      message:
        "🚗 Tôi có thể giúp bạn chọn xe Ford phù hợp (gia đình, SUV, bán tải, giá xe)."
    };

  } catch (err) {
    console.error("🔥 AI ERROR:", err);

    return {
      message: "❌ AI đang xử lý quá tải, thử lại sau"
    };
  }
};