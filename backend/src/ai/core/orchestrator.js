import { intentEngine } from "./intentEngine.js";
import { entityEngine } from "./entityEngine.js";
import { router } from "./router.js";
import { saveContext, getContext } from "./contextManager.js";
import { ragEngine } from "../rag/ragEngine.js";
import { formatResponse } from "../utils/formatResponse.js";

export const orchestrator = async (userId, message) => {
  const intent = intentEngine(message);
  const entities = await entityEngine(message);

  const context = getContext(userId);

  const merged = {
    ...(context?.entities || {}),
    ...entities,
  };

  saveContext(userId, {
    intent: intent.intent,
    entities: merged,
  });

  const result = await router(intent.intent, merged, message);

  if (result) return formatResponse(result);

  const rag = await ragEngine(message);

  return formatResponse({
    intent: "RAG_FALLBACK",
    message: rag,
    entities: merged,
  });
};

export default orchestrator;