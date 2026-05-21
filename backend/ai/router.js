import { agentCore } from "./agent/agentCore.js";

export const chatRouter = async (req, res) => {

  const { message, userId } = req.body;

  const reply = await agentCore(userId || "guest", message);

  res.json({
    success: true,
    reply
  });
};