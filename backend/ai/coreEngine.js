import Variant from "../src/models/Variant.js";
import VehicleModel from "../src/models/VehicleModel.js";
import CarProblem from "../src/models/CarProblem.js";
import News from "../src/models/News.js";

const parseBudget = (text) => {
  const match = text.match(/(\d+)\s*tỷ/);
  return match ? Number(match[1]) * 1_000_000_000 : null;
};

export const AIEngine = async (message) => {

  const text = message.toLowerCase();

  let query = {};
  let results = await Variant.find().populate("modelId");

  // ======================
  // FILTER: PRICE
  // ======================
  const budget = parseBudget(text);
  if (budget) {
    results = results.filter(v => v.basePrice <= budget);
  }

  // ======================
  // FILTER: TYPE
  // ======================
  if (text.includes("suv")) {
    results = results.filter(v => v.modelId.type === "SUV");
  }

  if (text.includes("7 chỗ")) {
    results = results.filter(v => v.modelId.seats >= 7);
  }

  // ======================
  // RANKING ENGINE
  // ======================
  results = results.sort((a, b) =>
    (b.modelId.isHot ? 10 : 0) + b.basePrice -
    (a.modelId.isHot ? 10 : 0) - a.basePrice
  );

  if (!results.length) {
    return "Không tìm thấy xe phù hợp 😢";
  }

  let reply = "🚗 Gợi ý xe phù hợp:\n\n";

  results.slice(0, 5).forEach(v => {
    reply += `• ${v.modelId.name} ${v.variantName}
💰 ${v.basePrice.toLocaleString()} VNĐ\n\n`;
  });

  return reply;
};