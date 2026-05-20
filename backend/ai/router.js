import { searchBrain } from "./brainSearch.js";
import { salesReasoning } from "./salesEngine.js";
import { getRecentContext } from "./memoryContext.js";
import { searchMemory } from "./memorySearch.js";

export const chatRouter = async (message, { userId }) => {
  try {
    const brainResults = await searchBrain(message, 10);

    const memory = await getRecentContext(userId, 5);
    const semanticMemory = await searchMemory(userId, message);

    const { recommendation, results } = salesReasoning(
      message,
      brainResults
    );

    const isAskingPrice =
      message.includes("giá") || message.includes("bao nhiêu");

    const isProblem = brainResults.find(r => r.type === "problem");

    // =========================
    // SALES MODE (MAIN LOGIC)
    // =========================
    if (recommendation) {
      return {
        mode: "sales",
        data: recommendation,
        results,
        memory: semanticMemory,
      };
    }

    // =========================
    // PROBLEM MODE
    // =========================
    if (isProblem) {
      return {
        mode: "problem",
        data: isProblem.raw,
      };
    }

    // =========================
    // PRICE MODE
    // =========================
    if (isAskingPrice) {
      return {
        mode: "price",
        data: brainResults.filter(r => r.type === "variant"),
      };
    }

    return {
      mode: "general",
      data: results,
      memory,
    };
  } catch (err) {
    console.error("BRAIN ERROR:", err);

    return {
      mode: "error",
      message: "AI Brain đang tự phục hồi...",
    };
  }
};