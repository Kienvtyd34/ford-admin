import semanticAI from "../ai/core/orchestrator.js";

export const chatController = async (req, res) => {
  try {
    const { message, userId } = req.body;

    const response = await semanticAI(
      userId || "guest",
      message
    );

    res.json({
      success: true,
      ...response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
