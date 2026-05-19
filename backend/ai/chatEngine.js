import { detectIntent } from "./intentEngine.js";
import { recommendCars } from "./salesEngine.js";
import { findProblem } from "./semanticEngine.js";
import { getSession, addMessage } from "../memory/salesMemory.js";

export const chatEngine = async (message, sessionId = "default") => {

  const session = getSession(sessionId);

  addMessage(sessionId, "user", message);

  const text = message.toLowerCase();

  const intent = detectIntent(text);

  session.profile.lastIntent = intent;

  // ======================
  // BUDGET DETECTION
  // ======================
  const budgetMatch = text.match(/(\d+)\s*tỷ/);
  if (budgetMatch) {
    session.profile.budget =
      Number(budgetMatch[1]) * 1_000_000_000;
  }

  // ======================
  // RECOMMEND CAR
  // ======================
  if (intent === "recommend" || intent === "price") {

    const cars = await recommendCars(session, text);

    if (!cars.length) {
      return "Không tìm thấy xe phù hợp 😢";
    }

    return (
      "🚗 Gợi ý xe phù hợp:\n\n" +
      cars.map(c =>
        `• ${c.modelId.name} ${c.variantName}
💰 ${c.basePrice.toLocaleString()} VNĐ`
      ).join("\n\n")
    );
  }

  // ======================
  // PROBLEM DETECTION
  // ======================
  if (intent === "problem") {

    const problem = await findProblem(text);

    if (!problem) {
      return "Không tìm thấy lỗi phù hợp 🔧";
    }

    return (
      `⚠️ ${problem.title}\n\n` +
      `Nguyên nhân:\n- ${problem.causes.join("\n- ")}\n\n` +
      `Giải pháp:\n- ${problem.solutions.join("\n- ")}`
    );
  }

  // ======================
  // DEFAULT RESPONSE
  // ======================
  return "Tôi có thể tư vấn xe Ford, giá, màu, lỗi, và hỗ trợ đặt lái thử 🚗";
};