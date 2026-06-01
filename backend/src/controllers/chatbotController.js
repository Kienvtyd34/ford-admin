import { orchestrator } from "../ai/core/orchestrator.js";

export const chatController = async (req, res) => {
  try {
    const { message, userId } = req.body;

    const response = await orchestrator(
      userId || "guest",
      message
    );

    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};