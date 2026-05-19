import VehicleModel from "../src/models/VehicleModel.js";
import Variant from "../src/models/Variant.js";
import CarProblem from "../src/models/CarProblem.js";
import News from "../src/models/News.js";

import { detectIntent } from "./intent.js";
import { saveMemory } from "./memory.js";
import { search } from "./vectorStore.js";

export const semanticAI = async (userId, message) => {

  const intent = detectIntent(message);

  await saveMemory(userId, "user", message, intent);

  // =======================
  // VECTOR SEARCH (semantic fallback)
  // =======================
  const semanticResults = search(message, 5);

  // =======================
  // RECOMMEND
  // =======================
  if (intent === "recommend") {
    const variants = await Variant.find().populate("modelId");

    const result = variants
      .filter(v => v.basePrice <= 1000000000)
      .slice(0, 5);

    return {
      message:
        "🚗 Gợi ý xe phù hợp:\n\n" +
        result.map(v =>
          `• ${v.modelId.name} ${v.variantName} - ${v.basePrice.toLocaleString()} VNĐ`
        ).join("\n")
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
  // FALLBACK: VECTOR AI
  // =======================
  if (semanticResults.length > 0) {
    return {
      message:
        "🔎 Tôi tìm thấy thông tin liên quan:\n\n" +
        semanticResults.map(r => `• ${r.title || r.name}`).join("\n")
    };
  }

  return {
    message: "🚗 Tôi có thể tư vấn xe Ford: giá, SUV, lỗi, khuyến mãi..."
  };
};