import { agentCore } from "../core/agentCore.js";

export const chatRouter = async (req, res) => {
  try {
    const { message, userId } = req.body;

    const result = await agentCore(
      userId || "guest",
      message
    );

    res.json({
      success: true,
      reply: result.message,
      data: result.data || null,
    });

  } catch (err) {

    console.error("CHAT ERROR:", err);

    res.status(500).json({
      success: false,
      reply: "Lỗi AI server",
      error: err.message,
    });
  }
};