import { search } from "./search.js";
import { detectIntent } from "./intentEngine.js";
import { getRecentContext } from "./memoryContext.js";
import { searchMemory } from "./memorySearch.js";

const route = (scores) => {
  const top = scores[0];
  const top2 = scores[1];

  if (top.score >= 0.62) {
    return { type: "DIRECT", intent: top.intent };
  }

  if (top.score >= 0.48 && top2?.score >= 0.42) {
    return { type: "HYBRID", intents: [top, top2] };
  }

  if (top.score < 0.4) {
    return { type: "RAG" };
  }

  return { type: "CLARIFY" };
};

export const chatRouter = async (message, { userId }) => {
  try {
    const intentScores = await detectIntent(message);
    const decision = route(intentScores);

    const recentMemory = await getRecentContext(userId, 5);
    const semanticMemory = await searchMemory(userId, message);
    const ragResults = await search(message, 5);

    if (decision.type === "DIRECT") {
      return {
        mode: "direct",
        intent: decision.intent,
        data: ragResults,
        memory: recentMemory,
      };
    }

    if (decision.type === "HYBRID") {
      return {
        mode: "hybrid",
        intents: decision.intents,
        data: ragResults,
        memory: semanticMemory,
      };
    }

    if (decision.type === "RAG") {
      return {
        mode: "rag",
        data: ragResults,
        memory: semanticMemory,
      };
    }

    return {
      mode: "clarify",
      message:
        "Mình có thể giúp bạn:\n• Tư vấn xe Ford\n• Giá xe\n• Xe gia đình\n• Khuyến mãi",
      memory: recentMemory,
    };
  } catch (err) {
    console.error(err);
    return {
      mode: "error",
      message: "Hệ thống lỗi",
    };
  }
};