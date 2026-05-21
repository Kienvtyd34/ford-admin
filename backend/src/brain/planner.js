import { geminiModel }
from "../core/geminiClient.js";

export const planner = async (input) => {

  try {

    const prompt = `
Chọn tool:

salesEngine
compareEngine
installmentEngine
none

Input:
${JSON.stringify(input)}

Chỉ trả JSON.
`;

    const result =
      await geminiModel.generateContent(
        prompt
      );

    const text =
      result.response.text();

    console.log("RAW:", text);

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);

  } catch (err) {

    console.error(
      "PLANNER ERROR:",
      err
    );

    return {
      tool: "none",
      args: {}
    };

  }

};