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

  // ================= CONTEXT =================

  const context =
    getConversationContext(userId);

  // ================= SEARCH =================

  const results =
    await searchBrain(
      message,
      20
    );

  // ================= PROBLEM =================

  const problemKeywords = [
    "rung",
    "giật",
    "lỗi",
    "hỏng",
    "máy",
    "động cơ",
    "vào số",
    "không lạnh",
  ];

  const isProblem =
    problemKeywords.some((k) =>
      lower.includes(k)
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
    if (isProblem && !problem) {
  return {
    mode: "fallback",
    reply:
      "Anh/chị có thể mô tả rõ lỗi xe hơn được không ạ?",
  };
}
  }

  // ================= PRICE =================

  if (
    lower.includes("giá") ||
    lower.includes("báo giá") ||
    lower.includes("bao nhiêu")
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

  // ================= SALES =================

  const sales =
    await salesEngine(
      message,
      results,
      context
    );

  if (sales.success) {

    saveConversationContext(
      userId,
      {
        lastVehicle:
          sales.data,
        lastMode: "sales",

        seats:
          sales.entities?.seats,

        type:
          sales.entities?.type,

        budget:
          sales.entities?.budget,
      }
    );

    return {
      mode: "sales",
      data: sales.data,
    };
  }

  // ================= SAVE PARTIAL CONTEXT =================

  if (sales.entities) {

    saveConversationContext(
      userId,
      sales.entities
    );
  }

  return {
    mode: "fallback",
    reply:
      sales.askBack ||
      "Anh/chị cần xe gì ạ?",
  };
};