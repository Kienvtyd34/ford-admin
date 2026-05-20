import { search } from "./search.js";
import { detectIntent } from "./intentEngine.js";
import { getRecentContext } from "./memoryContext.js";
import { searchMemory } from "./memorySearch.js";
import { selfHealIntent } from "./selfHealIntent.js";
import { getHealthState, reportFailure, reportSuccess } from "./health.js";

const route = (scores) => {
  const top = scores[0];
  const top2 = scores[1];

  if (top.score >= 0.60) {
    return { type: "DIRECT", intent: top.intent };
  }

  if (top.score >= 0.45 && top2?.score >= 0.40) {
    return { type: "HYBRID", intents: [top, top2] };
  }

  if (top.score < 0.35) {
    return { type: "RAG" };
  }

  return { type: "CLARIFY" };
};

export const chatRouter = async (message, { userId }) => {
  try {
    const intentScoresRaw = await detectIntent(message);

    // 🧠 SELF HEAL INTENT LAYER
    const intentScores = selfHealIntent(message, intentScoresRaw);

    const decision = route(intentScores);

    const recentMemory = await getRecentContext(userId, 5);
    const semanticMemory = await searchMemory(userId, message);
    const ragResults = await search(message, 5);

    reportSuccess(); // health OK

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
        "🚗 Mình có thể giúp bạn chọn xe Ford:\n\n" +
        "• Xe gia đình 7 chỗ\n" +
        "• Giá xe\n" +
        "• Khuyến mãi\n" +
        "• Tư vấn chọn xe",
      memory: recentMemory,
    };

  } catch (err) {
    console.error("ROUTER ERROR:", err);

    reportFailure();

    return {
      mode: "error",
      message: "⚠️ Hệ thống đang tự khôi phục, vui lòng thử lại",
    };
  }
};