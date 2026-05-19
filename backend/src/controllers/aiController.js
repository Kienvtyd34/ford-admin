import { chatEngine } from "../../ai/chatEngine.js";

export const chatController = async (req, res) => {

  const { message, sessionId } = req.body;

  const reply = await chatEngine(message, sessionId);

  res.json({
    success: true,
    reply
  });
};