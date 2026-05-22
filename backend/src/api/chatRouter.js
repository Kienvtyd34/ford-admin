import { agentCore } from "../core/agentCore.js";

export const chatRouter = async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.json({
        success: false,
        reply: "Thiếu message",
      });
    }

    const result = await agentCore(userId || "guest", message);

    let reply = result.reply;

    // ALWAYS STRING SAFE
    if (Array.isArray(reply)) {
      reply = reply.join("\n\n");
    }

    return res.json({
      success: true,
      type: result.type,
      reply,
    });
  } catch (err) {
    return res.json({
      success: false,
      reply: "AI server error",
    });
  }
};