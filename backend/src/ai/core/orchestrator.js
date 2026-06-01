import { intentEngine } from "./intentEngine.js";
import { entityEngine } from "./entityEngine.js";
import { router } from "./router.js";
import { saveContext, getContext } from "./contextManager.js";
import { ragEngine } from "../rag/ragEngine.js";
import { formatResponse } from "../utils/formatResponse.js";

export const orchestrator = async (userId, message) => {
  try {
    const intent = intentEngine(message) || { intent: "FALLBACK" };
    const entities = await entityEngine(message).catch(() => ({}));

    const context = getContext(userId);

    const merged = {
      ...(context?.entities || {}),
      ...(entities || {}),
    };

    saveContext(userId, {
      intent: intent.intent,
      entities: merged,
    });

    let result = null;

    try {
      result = await router(intent.intent, merged, message);
    } catch (e) {
      console.error("Router error:", e);
    }

    if (result?.message) {
      return formatResponse(result);
    }

    let rag = null;

    try {
      rag = await ragEngine(message);
    } catch (e) {
      console.error("RAG error:", e);
    }

    return formatResponse({
      intent: "FALLBACK",
      message:
        rag?.answer ||
        "🤖 Tôi chưa hiểu rõ yêu cầu, bạn có thể nói rõ hơn không?",
      entities: merged,
    });

  } catch (e) {
    console.error("CRITICAL ERROR:", e);

    return {
      success: false,
      intent: "SYSTEM_SAFE_MODE",
      message: "🤖 Hệ thống đang bảo trì nhẹ, vui lòng thử lại.",
      timestamp: Date.now(),
    };
  }
};

export default orchestrator;