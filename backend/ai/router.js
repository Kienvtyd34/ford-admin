import { searchBrain } from "./brain/brainSearch.js";
import { salesEngine } from "./salesEngine.js";
import { problemEngine } from "./problemEngine.js";
import { priceEngine } from "./priceEngine.js";
import {
  saveConversationContext,
  getConversationContext,
} from "./memory/sessionMemory.js";

export const chatRouter = async (
  message,
  userId = "guest"
) => {

  const lower = message.toLowerCase();

  // =========================
  // LOAD CONTEXT
  // =========================

  const context =
    getConversationContext(userId);

  // =========================
  // SEARCH BRAIN
  // =========================

  const results = await searchBrain(
    message,
    20
  );

  // =========================
  // PROBLEM PRIORITY
  // =========================

  const problemKeywords = [
    "rung",
    "giật",
    "lỗi",
    "hỏng",
    "nóng",
    "không nổ",
    "không lạnh",
    "vào số",
    "máy",
    "động cơ",
  ];

  const isProblem = problemKeywords.some(
    (k) => lower.includes(k)
  );

  if (isProblem) {

    const problem =
      await problemEngine(
        message,
        results
      );

    if (problem) {

      saveConversationContext(
        userId,
        {
          lastMode: "problem",
        }
      );

      return {
        mode: "problem",
        data: problem,
      };
    }
  }

  // =========================
  // PRICE MODE
  // =========================

  if (
    lower.includes("giá") ||
    lower.includes("bao nhiêu") ||
    lower.includes("báo giá")
  ) {

    const prices =
      await priceEngine(
        results,
        context
      );

    return {
      mode: "price",
      data: prices,
    };
  }

  // =========================
  // SALES MODE
  // =========================

  const sales =
  await salesEngine(
    message,
    results,
    context
  );

// =========================
// SAVE ENTITIES CONTEXT
// =========================

if (sales.entities) {

  saveConversationContext(
    userId,
    {
      entities: {
        ...(context.entities || {}),
        ...sales.entities,
      },
    }
  );
}

  if (sales.success) {

   saveConversationContext(
  userId,
  {
    lastVehicle: sales.data,
    lastMode: "sales",
    entities: {
      ...(context.entities || {}),
      ...(sales.entities || {}),
    },
  }
);

    return {
      mode: "sales",
      data: sales.data,
    };
  }

  return {
    mode: "fallback",
    reply:
      sales.askBack ||
      "Anh/chị cần xe gia đình hay bán tải ạ?",
  };
};