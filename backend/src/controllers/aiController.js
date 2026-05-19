import {
  processUserQuestion
} from "../ai/chatbotEngine.js";

export const chatbot =
async (req, res) => {

  try {

    const { message } = req.body;

    const result =
      await processUserQuestion(
        message
      );

    res.json({
      success: true,
      data: result
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};