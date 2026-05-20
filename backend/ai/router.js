import { searchBrain } from "./brain/brainSearch.js";
import { salesEngine } from "./salesEngine.js";
import { problemEngine } from "./problemEngine.js";
import { priceEngine } from "./priceEngine.js";

export const chatRouter = async (
  message
) => {
  const results = await searchBrain(
    message,
    20
  );

  // ================= PROBLEM =================

  const problem =
    await problemEngine(
      message,
      results
    );

  if (problem) {
    return {
      mode: "problem",
      data: problem,
    };
  }

  // ================= PRICE =================

  if (
    message.includes("giá") ||
    message.includes("bao nhiêu")
  ) {
    return {
      mode: "price",
      data: await priceEngine(results),
    };
  }

  // ================= SALES =================

  const sales =
    await salesEngine(
      message,
      results
    );

  if (sales.success) {
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