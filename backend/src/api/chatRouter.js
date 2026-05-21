import { agentCore }
from "../core/agentCore.js";

export const chatRouter = async (req, res) => {

  try {

    const { message, userId } = req.body;

    console.log("REQUEST:", {
      userId,
      message
    });

    const reply = await agentCore(
      userId || "guest",
      message
    );

    console.log("REPLY:", reply);

    return res.json({
      success: true,
      reply
    });

  } catch (err) {

    console.error(
      "CHAT ERROR FULL:",
      err
    );

    return res.status(500).json({
      success: false,
      reply: err.message,
      stack: err.stack
    });

  }

};