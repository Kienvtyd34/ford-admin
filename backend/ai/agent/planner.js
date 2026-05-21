import { openai } from "../core/openaiClient.js";

export const planner = async (input) => {

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{
      role: "user",
      content: `
Chọn tool: salesEngine | compareEngine | installmentEngine | none

Input:
${JSON.stringify(input)}

Trả JSON:
{"tool":"...","args":{}}
`
    }],
    temperature: 0.2
  });

  try {
    return JSON.parse(res.choices[0].message.content);
  } catch {
    return { tool: "none", args: {} };
  }
};