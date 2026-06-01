import intentEngine from "./intentEngine.js";
import entityEngine from "./entityEngine.js";
import router from "./router.js";
import contextManager from "./contextManager.js";
import ragEngine from "../rag/ragEngine.js";
import { formatResponse } from "../utils/formatResponse.js";

export const orchestrator = async (userId, message) => {
  try {
    const context = contextManager.getContext(userId);

    const intent = intentEngine(message);

    // 🔥 FIX: truyền context vào entityEngine
    const entities = await entityEngine(message, context);

    const merged = {
      ...(context?.entities || {}),
      ...entities,
    };

    contextManager.saveContext(userId, {
      intent: intent.intent,
      entities: merged,
    });

    const result = await router(intent.intent, merged, message);

    if (result) return formatResponse(result);

    const rag = await ragEngine(message);

    return formatResponse({
      intent: "RAG_FALLBACK",
      message: rag?.answer || "🤖 Tôi chưa có dữ liệu phù hợp",
      entities: merged,
    });

  } catch (err) {
    return formatResponse({
      intent: "SYSTEM_ERROR",
      message: "❌ System error",
    });
  }
};

export default orchestrator;