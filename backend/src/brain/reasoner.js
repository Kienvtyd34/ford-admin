import { geminiModel }
from "../core/geminiClient.js";

export const reasoner = async ({
  message,
  toolResult
}) => {

  try {

    const prompt = `
Câu hỏi:
${message}

Dữ liệu:
${JSON.stringify(toolResult)}

Trả lời tự nhiên bằng tiếng Việt.
`;

    const result =
      await geminiModel.generateContent(
        prompt
      );

    return result.response.text();

  } catch (err) {

    console.error(
      "REASONER ERROR:",
      err
    );

    return `
REASONER ERROR:

${err.message}

STACK:
${err.stack}
`;

  }

};