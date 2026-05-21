import { geminiModel }
from "../core/geminiClient.js";

export const planner = async (input) => {

  try {

    const result =
      await geminiModel.generateContent(`
${JSON.stringify(input)}
`);

    const text =
      result.response.text();

    return JSON.parse(text);

  } catch (err) {

    console.log("PLANNER ERROR:", err.message);

    // fallback
    return {
      tool: "salesEngine",
      args: {}
    };
  }
};