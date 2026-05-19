import VehicleModel from "../src/models/VehicleModel.js";
import Variant from "../src/models/Variant.js";
import CarProblem from "../src/models/CarProblem.js";
import News from "../src/models/News.js";

import { vectorize, cosineSimilarity } from "./word2vecLite.js";
import { getMemory, saveMemory } from "./memoryStore.js";

const intents = [
  { name: "price", text: "giá bao nhiêu giá xe bao nhiêu tiền" },
  { name: "detail", text: "thông số chi tiết xe giới thiệu" },
  { name: "recommend", text: "xe gia đình 7 chỗ suv gợi ý" },
  { name: "problem", text: "xe lỗi không nổ phanh kêu" },
  { name: "news", text: "tin tức khuyến mãi sự kiện" }
];

const detectIntent = (text) => {
  const inputVec = vectorize(text);

  let best = { name: "unknown", score: 0 };

  for (let i of intents) {
    const vec = vectorize(i.text);
    const score = cosineSimilarity(inputVec, vec);

    if (score > best.score) {
      best = { name: i.name, score };
    }
  }

  return best.name;
};

export const semanticAI = async (userId, message) => {

  const intent = detectIntent(message);

  saveMemory(userId, message, intent);

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

  return {
    message: "Tôi có thể tư vấn xe Ford 🚗 giá, màu, lỗi, và khuyến mãi!"
  };
};