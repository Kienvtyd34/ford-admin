import { chatRouter } from "../../ai/router.js";
import { saveMemory } from "../../ai/memoryService.js";
import { getHealthState } from "../../ai/health.js";

const health = getHealthState();

if (health.status === "DEGRADED") {
  return res.json({
    success: true,
    reply:
      "⚠️ Hệ thống đang tự tối ưu lại AI.\n" +
      "Bạn vẫn có thể hỏi:\n" +
      "• Xe gia đình\n• Giá xe Ford\n• Xe 7 chỗ",
  });
}

export const chatController = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message?.trim()) {
      return res.json({
        success: false,
        reply: "Tin nhắn không hợp lệ",
      });
    }

    const result = await chatRouter(message, { userId });

    await saveMemory(userId, "user", message, result.intent || null);

    // DIRECT
    if (result.mode === "direct") {
      return res.json({
        success: true,
        reply:
          "🚗 Gợi ý xe phù hợp:\n\n" +
          (result.data || [])
            .slice(0, 5)
            .map((v) => `• ${v.modelId?.name || v.name}`)
            .join("\n"),
      });
    }

    // HYBRID
    if (result.mode === "hybrid") {
      return res.json({
        success: true,
        reply:
          "🔎 Tôi hiểu bạn đang quan tâm:\n\n" +
          result.data
            .slice(0, 5)
            .map((r) => `• ${r.modelId?.name || r.name}`)
            .join("\n"),
      });
    }

    // RAG
    if (result.mode === "rag") {
      return res.json({
        success: true,
        reply:
          "🔎 Gợi ý liên quan:\n\n" +
          result.data
            .slice(0, 5)
            .map((r) => `• ${r.name || r.title}`)
            .join("\n"),
      });
    }

    // CLARIFY
    return res.json({
      success: true,
      reply: result.message,
    });

  } catch (err) {
    console.error(err);
    return res.json({
      success: false,
      reply: "Server lỗi",
    });
  }
};