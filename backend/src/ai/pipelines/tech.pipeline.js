import CarProblem from "../../models/CarProblem.js";
import { normalize } from "../utils/normalize.js";

export default async (message) => {
  const text = normalize(message);

  const problems = await CarProblem.find();

  for (const p of problems) {
    const hit = p.symptoms.some(s =>
      text.includes(normalize(s))
    );

    if (hit) {
      return {
        intent: "TECH",
        message: `⚠️ ${p.title}\n\n🛠 Nguyên nhân:\n${p.causes.join("\n")}\n\n✅ Giải pháp:\n${p.solutions.join("\n")}`,
      };
    }
  }

  return {
    intent: "TECH",
    message: "⚠️ Tôi chưa xác định được lỗi cụ thể. Bạn mô tả rõ hơn giúp tôi.",
  };
};