import VehicleModel from "../src/models/VehicleModel.js";
import Variant from "../src/models/Variant.js";
import CarProblem from "../src/models/CarProblem.js";
import News from "../src/models/News.js";

import { detectIntent } from "./intent.js";
import { saveMemory } from "./memory.js";
import { search } from "./vectorStore.js";

export const semanticAI = async (userId, message) => {
  try {
    const msg = (message || "").toLowerCase();

    if (!msg.trim()) {
      return {
        message: "❌ Tin nhắn không hợp lệ"
      };
    }

    const intent = detectIntent(msg);

    await saveMemory(userId, "user", message, intent);

    // =========================
    // VECTOR FALLBACK SAFE
    // =========================
    let semanticResults = [];

    if (intent === "unknown") {
      try {
        semanticResults = (await search(message, 5)) || [];
      } catch (err) {
        console.error("VECTOR ERROR:", err);
        semanticResults = [];
      }
    }

    // =========================
    // PRICE
    // =========================
    if (intent === "price") {
      const models = await VehicleModel.find().lean();

      return {
        message:
          "💰 Danh sách xe Ford:\n\n" +
          models.map(m => `• ${m?.name || "Unknown"}`).join("\n")
      };
    }

    // =========================
    // NEWS
    // =========================
    if (intent === "news") {
      const news = await News.find().limit(5).lean();

      return {
        message:
          "📰 Tin tức Ford:\n\n" +
          news.map(n => `• ${n?.title || "No title"}`).join("\n")
      };
    }

    // =========================
    // PROBLEM
    // =========================
    if (intent === "problem") {
      const problems = await CarProblem.find().lean();

      return {
        message:
          "⚠️ Lỗi thường gặp:\n\n" +
          problems.map(p => `• ${p?.title || "Unknown"}`).join("\n")
      };
    }

    // =========================
    // RECOMMEND (SAFE + FIXED)
    // =========================
    if (intent === "recommend") {
      let variants = [];

      try {
        variants = await Variant.find()
          .populate("modelId")
          .lean();
      } catch (err) {
        console.error("DB ERROR:", err);
        return {
          message: "❌ Lỗi dữ liệu xe, vui lòng thử lại sau"
        };
      }

      // CLEAN DATA
      variants = (variants || []).filter(
        v => v && v.modelId && v.modelId.name
      );

      // FILTER
      if (msg.includes("7 chỗ") || msg.includes("gia đình")) {
        variants = variants.filter(v => v.modelId.seats >= 7);
      }

      if (msg.includes("suv")) {
        variants = variants.filter(v => v.modelId.type === "SUV");
      }

      if (msg.includes("bán tải")) {
        variants = variants.filter(v =>
          /ranger|raptor/i.test(v.modelId.name)
        );
      }

      if (msg.includes("mạnh nhất")) {
        variants = variants.sort(
          (a, b) => (b.basePrice || 0) - (a.basePrice || 0)
        );
      }

      const top = variants.slice(0, 5);

      return {
        message:
          "🚗 Gợi ý xe phù hợp:\n\n" +
          (top.length > 0
            ? top
                .map(v => {
                  const name = v.modelId.name;
                  const seats = v.modelId.seats;
                  const price = Number(v.basePrice || 0).toLocaleString();

                  return `• ${name} (${seats} chỗ) - ${price} VNĐ`;
                })
                .join("\n")
            : "⚠️ Không tìm thấy xe phù hợp")
      };
    }

    // =========================
    // VECTOR RESULT
    // =========================
    if (semanticResults.length > 0) {
      return {
        message:
          "🔎 Thông tin liên quan:\n\n" +
          semanticResults
            .map(r => `• ${r?.title || r?.name || "No data"}`)
            .join("\n")
      };
    }

    // =========================
    // DEFAULT
    // =========================
    return {
      message:
        "🚗 Tôi có thể hỗ trợ bạn:\n" +
        "- Xe gia đình\n- SUV\n- Bán tải\n- Giá xe Ford\n- Tin tức"
    };
  } catch (err) {
    console.error("🔥 GLOBAL ERROR:", err);

    return {
      message: "❌ Hệ thống đang tạm gián đoạn, vui lòng thử lại"
    };
  }
};