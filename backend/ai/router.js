import { search } from "./search.js";
import { detectIntent } from "./intentEngine.js";
import { getRecentContext } from "./memoryContext.js";
import { searchMemory } from "./memorySearch.js";

// ======================
// DECISION ENGINE (ChatGPT style)
// ======================
const route = (intentScores) => {
  const top = intentScores[0];
  const top2 = intentScores[1];

  // 1. HIGH CONFIDENCE → direct intent
  if (top.score >= 0.80) {
    return {
      type: "DIRECT",
      intent: top.intent,
    };
  }

  // 2. MULTI INTENT → hybrid reasoning
  if (top.score >= 0.55 && top2.score >= 0.45) {
    return {
      type: "HYBRID",
      intents: [top, top2],
    };
  }

  // 3. LOW CONFIDENCE → RAG fallback
  if (top.score < 0.45) {
    return {
      type: "RAG",
    };
  }

  // 4. UNCERTAIN → clarify
  return {
    type: "CLARIFY",
  };
};

// ======================
// MAIN CHATGPT-STYLE ROUTER
// ======================
export const chatRouter = async (message, { userId }) => {
  try {
    // ======================
    // 1. INTENT SCORING
    // ======================
    const intentScores = await detectIntent(message);

    const decision = route(intentScores);

    // ======================
    // 2. MEMORY (IMPORTANT UPGRADE)
    // ======================
    const recentMemory = await getRecentContext(userId, 5);
    const semanticMemory = await searchMemory(userId, message);

    // ======================
    // 3. SEMANTIC SEARCH (MAIN RAG DATA)
    // ======================
    const ragResults = await search(message, 5);

    // ======================
    // 4. ROUTING LOGIC
    // ======================

    // ======================
    // DIRECT MODE
    // ======================
    if (decision.type === "DIRECT") {
      return {
        mode: "direct",
        intent: decision.intent,
        memory: recentMemory,
      };
    }

    // ======================
    // HYBRID MODE (ChatGPT-style reasoning)
    // ======================
    if (decision.type === "HYBRID") {
      return {
        mode: "hybrid",
        intents: decision.intents,
        data: ragResults,
        memory: semanticMemory,
      };
    }

    // ======================
    // RAG MODE (search + memory fusion)
    // ======================
    if (decision.type === "RAG") {
      return {
        mode: "rag",
        data: ragResults,
        memory: semanticMemory,
      };
    }

    // ======================
    // CLARIFY MODE (ChatGPT behavior)
    // ======================
    return {
      mode: "clarify",
      message:
        "Bạn muốn tìm xe, giá xe, hay tư vấn chọn xe Ford?",
      memory: recentMemory,
    };
  } catch (err) {
    console.error("ROUTER ERROR:", err);

    return {
      mode: "error",
      message: "Hệ thống đang gặp lỗi",
    };
  }
};