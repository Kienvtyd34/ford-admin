import CarProblem
from "../src/models/CarProblem.js";

import {
  calculateScore
} from "./fuzzyMatcher.js";

export const diagnoseProblem =
async (message) => {

  const problems =
    await CarProblem.find();

  let bestMatch = null;

  let bestScore = 0;

  for (const problem of problems) {

    const score =
      calculateScore(
        problem.symptoms,
        message
      );

    if (score > bestScore) {

      bestScore = score;

      bestMatch = problem;
    }
  }

  if (bestScore < 55) {
    return null;
  }

  return bestMatch;
};