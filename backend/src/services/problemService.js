import CarProblem from "../models/CarProblem.js";
import { cleanText } from "../utils/cleanText.js";

export const findProblem = async (message) => {
  const msg = cleanText(message);

  const problems = await CarProblem.find({});

  let best = null;
  let scoreMax = 0;

  for (const p of problems) {
    for (const s of p.symptoms) {
      if (msg.includes(cleanText(s))) {
        return p;
      }
    }
  }

  return best;
};