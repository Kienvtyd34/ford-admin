import { processSemanticAI } from "../nlp/nlpManager.js";
import { generateResponse } from "../engine/responseEngine.js";
import { getMemory, updateMemory } from "../memory/chatMemory.js";

export const handleChatInteraction = async (req, res) => {

  try {
    const { message, userId = "u1" } = req.body;

    if (!message)
      return res.status(400).json({ text: "Thiếu nội dung" });

    const memory = getMemory(userId);

    const { intent, entities } =
      await processSemanticAI(message, memory);

    updateMemory(userId, entities);

    const reply = await generateResponse({
      intent,
      entities,
      message
    });

    return res.json({ text: reply });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      text: "Hệ thống tạm lỗi"
    });
  }
};