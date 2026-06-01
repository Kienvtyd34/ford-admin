import intentEngine from "./intentEngine.js";
import entityEngine from "./entityEngine.js";
import router from "./router.js";
import contextManager from "./contextManager.js";
import ragEngine from "../rag/ragEngine.js";
import { formatResponse } from "../utils/formatResponse.js";

export const orchestrator = async (userId, message) => {
  const intent = intentEngine(message);
  const entities = await entityEngine(message);

  const context = contextManager.getContext(userId);

  const merged = {
    ...(context?.entities || {}),
    ...entities,
  };

  contextManager.saveContext(userId, {
    intent: intent.intent,
    entities: merged,
  });

  const result = await router(intent.intent, merged, message);

  // ======================
  // FIX: always return valid response
  // ======================
  if (result?.message) {
    return formatResponse(result);
  }

  const rag = await ragEngine(message);

  if (rag?.answer) {
    return formatResponse({
      intent: "RAG",
      message: rag.answer,
      entities: merged,
    });
  }

  return formatResponse({
    intent: "UNKNOWN",
    message:
      "🚗 Tôi chưa hiểu rõ yêu cầu. Hãy thử: giá xe / xe 7 chỗ / xe giao ngay",
  });
};

export default orchestrator;