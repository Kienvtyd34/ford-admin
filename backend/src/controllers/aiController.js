import { AIEngine } from "../../ai/coreEngine.js";

export const chatController = async (req, res) => {

  const { message } = req.body;

  const response = await AIEngine(message);

  res.json({
    success: true,
    reply: response
  });
};