import { search } from "./search.js";
import { detectIntent } from "./intentEngine.js";

const route = (intents) => {
  const top = intents[0];
  const top2 = intents[1];

  if (top.score > 0.8) {
    return { type: "DIRECT", intent: top.intent };
  }

  if (top.score > 0.55 && top2.score > 0.45) {
    return { type: "HYBRID", intents: [top, top2] };
  }

  if (top.score < 0.45) {
    return { type: "RAG" };
  }

  return { type: "CLARIFY" };
};

export const chatRouter = async (message, context = {}) => {
  const intents = await detectIntent(message);
  const decision = route(intents);

  if (decision.type === "DIRECT") {
    return {
      mode: "direct",
      intent: decision.intent,
    };
  }

  if (decision.type === "HYBRID") {
    const data = await search(message, 5);

    return {
      mode: "hybrid",
      data,
      intents: decision.intents,
    };
  }

  if (decision.type === "RAG") {
    const data = await search(message, 5);

    return {
      mode: "rag",
      data,
    };
  }

  return {
    mode: "clarify",
    message:
      "Bạn muốn hỏi giá xe, tư vấn xe hay thông tin kỹ thuật?",
  };
};