import { chatRouter } from "../../ai/router.js";

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

    if (result.mode === "clarify") {
      return res.json({ success: true, reply: result.message });
    }

    if (result.mode === "rag" || result.mode === "hybrid") {
      return res.json({
        success: true,
        reply:
          "🔎 Kết quả:\n\n" +
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
    return res.status(500).json({
      success: false,
      reply: "Server lỗi",
    });
  }
};