import { openai } from "../core/openaiClient.js";

export const planner = async (input) => {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
Bạn là planner AI cho hệ thống bán xe.

Chỉ trả JSON:

{
  "tool": "salesEngine | compareEngine | installmentEngine | none",
  "args": {},
  "confidence": 0-1
}

QUY TẮC:
- Không bịa args
- Không giải thích
- Sai thì chọn "none"
`
      },
      {
        role: "user",
        content: JSON.stringify(input)
      }
    ]
  });

  try {
    return JSON.parse(res.choices[0].message.content);
  } catch {
    return { tool: "none", args: {}, confidence: 0 };
  }
};