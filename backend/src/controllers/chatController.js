import { chatRouter } from "../../ai/router.js";
import { saveMemory } from "../../src/models/memory.js";

export const chatController = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({
        success: false,
        reply: "Tin nhắn không hợp lệ",
      });
    }

    const result = await chatRouter(message, { userId });

    // ======================
    // SAVE MEMORY (IMPORTANT)
    // ======================
    await saveMemory(userId, "user", message, result.intent || null);

    // ======================
    // RESPONSE BUILD
    // ======================

    if (result.mode === "clarify") {
      return res.json({
        success: true,
        reply: result.message,
      });
    }

    if (result.mode === "rag" || result.mode === "hybrid") {
      return res.json({
        success: true,
        reply:
          "🔎 Tôi tìm thấy thông tin liên quan:\n\n" +
          result.data
            .slice(0, 5)
            .map((r) => `• ${r.modelId?.name || r.name}`)
            .join("\n"),
      });
    }

    if (result.mode === "direct") {
      return res.json({
        success: true,
        reply: `👉 Intent: ${result.intent}`,
      });
    }

    return res.json({
      success: true,
      reply: "🚗 Tôi có thể giúp bạn chọn xe Ford",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      reply: "Server lỗi",
    });
  }
};