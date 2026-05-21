import { openai } from "../core/openaiClient.js";

export const reasoner = async ({ message, toolResult }) => {

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: `
Câu hỏi: ${message}

Dữ liệu:
${JSON.stringify(toolResult)}

Hãy trả lời tự nhiên, đúng dữ liệu.
`
    }]
  });

  return res.choices[0].message.content;
};