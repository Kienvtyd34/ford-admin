import { chatRouter } from "../../ai/router.js";
import { saveMemory } from "../../ai/memoryService.js";

export const chatController = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.json({
        success: false,
        reply: "Vui lòng nhập nội dung",
      });
    }

    const result = await chatRouter(message, { userId });

    await saveMemory(userId, "user", message, result.mode);

    // ================= SALES RESPONSE =================
    if (result.mode === "sales") {
      const v = result.data;

      return res.json({
        success: true,
        reply:
          `🚗 Gợi ý phù hợp cho bạn:\n` +
          `👉 ${v.name}\n` +
          `👥 ${v.seats} chỗ - ${v.type}\n` +
          `💡 ${v.description?.slice(0, 120) || ""}`,
      });
    }

    // ================= PROBLEM =================
    if (result.mode === "problem") {
      return res.json({
        success: true,
        reply:
          `🔧 Vấn đề: ${result.data.title}\n` +
          `👉 Giải pháp: ${result.data.solutions.join(", ")}`,
      });
    }

    // ================= PRICE =================
    if (result.mode === "price") {
      return res.json({
        success: true,
        reply:
          "💰 Các phiên bản & giá:\n" +
          result.data
            .map(v => `• ${v.variantName}: ${v.basePrice}`)
            .join("\n"),
      });
    }

    return res.json({
      success: true,
      reply: "🚗 Tôi có thể giúp bạn chọn xe Ford phù hợp",
    });
  } catch (err) {
    console.error(err);

    return res.json({
      success: true,
      reply: "⚠️ AI đang tự khôi phục, vui lòng thử lại",
    });
  }
};