import { agentCore } from "../core/agentCore.js";

export const chatRouter = async (req, res) => {
  try {
    const { message, userId } = req.body;

    const reply = await agentCore(userId || "guest", message, {
      redis: req.redis
    });

    res.json({
      success: true,
      reply
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      reply: "Hệ thống đang lỗi, vui lòng thử lại."
    });
  }
};