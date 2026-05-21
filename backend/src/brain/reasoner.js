import { openai } from "../core/openaiClient.js";

export const reasoner = async ({ message, toolResult }) => {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
Bạn là AI tư vấn xe hơi.

QUY TẮC:
- Chỉ dùng dữ liệu được cung cấp
- Không bịa thông tin
- Thiếu dữ liệu → nói "Không có thông tin phù hợp"
- Trả lời ngắn gọn, rõ ràng
`
      },
      {
        role: "user",
        content: JSON.stringify({
          question: message,
          data: toolResult
        })
      }
    ]
  });

  return res.choices[0].message.content;
};