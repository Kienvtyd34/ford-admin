import { agentCore } from "../core/agentCore.js";

export const chatRouter = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        reply: "Thiếu message",
      });
    }

    const result = await agentCore(userId || "guest", message);

    // ================= NORMALIZE OUTPUT =================
    let textReply = "";

    if (typeof result.reply === "string") {
      textReply = result.reply;
    } else if (Array.isArray(result.reply)) {
      textReply = result.reply
        .map((r) => {
          return `🚗 ${r.name}
💰 ${r.price?.toLocaleString("vi-VN") || "Liên hệ"} VNĐ
👥 ${r.seats || ""} chỗ`;
        })
        .join("\n\n");
    } else if (typeof result.reply === "object") {
      textReply = Object.entries(result.reply)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
    } else {
      textReply = String(result.reply);
    }

    return res.json({
      success: true,
      type: result.type,
      reply: textReply,
    });

  } catch (err) {
    console.error("CHAT ERROR:", err);

    return res.status(500).json({
      success: false,
      reply: "AI server error",
    });
  }
};