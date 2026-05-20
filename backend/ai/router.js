import { searchBrain } from "./brain/brainSearch.js";

import { salesEngine } from "./salesEngine.js";
import { problemEngine } from "./problemEngine.js";
import { priceEngine } from "./priceEngine.js";

import {
  saveConversationContext,
  getConversationContext,
} from "./memory/sessionMemory.js";

// ================= NORMALIZE =================

const normalize = (text = "") => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

export const chatRouter = async (
  message,
  userId = "guest"
) => {

  const text = normalize(message);

  // =========================
  // CONTEXT
  // =========================

  const context =
    getConversationContext(userId);

  // =========================
  // SEARCH
  // =========================

  const results =
    await searchBrain(message, 20);

  // =====================================================
  // PROBLEM DETECTION
  // =====================================================

  const problemKeywords = [
    "rung",
    "giat",
    "loi",
    "hong",
    "nong",
    "khong mat",
    "khong lanh",
    "dieu hoa",
    "vao so",
    "dong co",
    "chet may",
    "khong no",
    "abs",
    "u3000",
  ];

  const isProblem =
    problemKeywords.some((k) =>
      text.includes(k)
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

  // =====================================================
  // PRICE
  // =====================================================

  const isPrice =
    text.includes("gia") ||
    text.includes("bao nhieu") ||
    text.includes("bao gia");

  if (isPrice) {

    const prices =
      await priceEngine(
        results,
        context
      );

    if (
      !prices ||
      prices.length === 0
    ) {
      return {
        mode: "fallback",
        reply:
          "Hiện chưa tìm thấy bảng giá phù hợp",
      };
    }

    return {
      mode: "price",
      data: prices,
    };
  }

  // =====================================================
  // SALES DETECTION
  // =====================================================

  const salesKeywords = [
    "xe",
    "tim xe",
    "mua xe",
    "gia dinh",
    "suv",
    "sedan",
    "ban tai",
    "5 cho",
    "7 cho",
    "tra gop",
    "lai thu",
  ];

  const isSales =
    salesKeywords.some((k) =>
      text.includes(k)
    );

  if (isSales) {

    const sales =
      await salesEngine(
        message,
        results,
        context
      );

    // SAVE CONTEXT

    if (sales.entities) {

      saveConversationContext(
        userId,
        sales.entities
      );
    }

    if (sales.success) {

      saveConversationContext(
        userId,
        {
          lastVehicle:
            sales.data,
          lastMode: "sales",
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
        "Anh/chị cần xe gì ạ?",
    };
  }

  // =====================================================
  // DEFAULT
  // =====================================================

  return {
    mode: "fallback",
    reply:
      "Anh/chị cần hỗ trợ mua xe hay kiểm tra lỗi xe ạ?",
  };
};