import { semanticAI } from "../../ai/semanticEngine.js";

export const chatController = async (req, res) => {
  try {
    const { message, userId } = req.body;

    // ✅ VALIDATION
    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        reply: "Tin nhắn không hợp lệ"
      });
    }

    const reply = await semanticAI(userId || "guest", message);

    return res.status(200).json({
      success: true,
      reply: reply?.message || "Không có phản hồi"
    });

  } catch (err) {
    console.error("CHAT ERROR:", err);

    return res.status(500).json({
      success: false,
      reply: "Server đang bận, vui lòng thử lại"
    });
  }
};