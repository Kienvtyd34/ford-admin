import CarProblem from "../../models/CarProblem.js";

import { normalize } from "../../../src/utils/normalize.js";

export const findCarProblem = async (
  message
) => {
  const text = normalize(message);

  const problems =
    await CarProblem.find();

  for (const problem of problems) {
    const found =
      problem.symptoms.some(
        (symptom) =>
          text.includes(
            normalize(symptom)
          )
      );

    if (found) {
      return problem;
    }
  }

  return null;
};
