import { agentCore } from "../core/agentCore.js";

export const chatRouter = async (
  req,
  res
) => {

  try {

    const {
      message,
      userId,
    } = req.body;

    // validate
    if (!message) {
      return res.status(400).json({
        reply: "Thiếu message"
      });
    }

    // AI RESPONSE
    const reply =
      await agentCore(
        userId || "guest",
        message
      );

    // RETURN
    return res.json({
      success: true,
      reply,
    });

  } catch (err) {

    console.error(
      "CHAT ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      reply: "AI server error",
      error: err.message,
    });
  }
};