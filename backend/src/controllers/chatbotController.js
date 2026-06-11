import { processSemanticAI } from "../nlp/nlpManager.js";
import { generateResponse } from "../engine/responseEngine.js";

export const handleChatInteraction = async (req, res) => {

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ text: "Thiếu nội dung" });
    }

    const { intent, entities } = await processSemanticAI(message);

    const reply = await generateResponse({
      intent,
      entities,
      message
    });

    return res.json({ text: reply });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      text: "Hệ thống tạm lỗi, vui lòng thử lại."
    });
  }
};