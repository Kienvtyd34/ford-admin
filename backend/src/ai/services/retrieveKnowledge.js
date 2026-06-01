import faqData from "../data/faqData.js";
import CarProblem from "../../models/CarProblem.js";
import { normalize } from "../../../src/utils/normalize.js";

export const retrieveKnowledge = async (message) => {
  const text = normalize(message);

  for (const item of faqData) {
    if (item.keywords.some(k => text.includes(k))) {
      return { type: "FAQ", data: item.answer };
    }
  }

  const problems = await CarProblem.find();

  for (const p of problems) {
    if (p.symptoms.some(s => text.includes(normalize(s)))) {
      return { type: "TECH", data: p };
    }
  }

  return null;
};