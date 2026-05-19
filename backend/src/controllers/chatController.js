import { semanticAI } from "../../ai/semanticEngine.js";

export const chatController = async (req, res) => {
  try {
    const { message, userId } = req.body;

    const reply = await semanticAI(userId || "guest", message);

    res.json({
      success: true,
      reply: reply.message
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};