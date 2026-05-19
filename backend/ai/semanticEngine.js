import CarProblem from "../models/CarProblem.js";

export const findProblem = async (text) => {

  const problems = await CarProblem.find();

  const score = (a, b) => {
    const setA = a.toLowerCase().split(" ");
    const setB = b.toLowerCase().split(" ");

    let match = 0;

    setA.forEach(w => {
      if (setB.includes(w)) match++;
    });

    return match / setB.length;
  };

  let best = null;
  let bestScore = 0;

  for (let p of problems) {

    const textData =
      `${p.title} ${p.symptoms.join(" ")} ${p.causes.join(" ")}`;

    const s = score(textData, text);

    if (s > bestScore) {
      bestScore = s;
      best = p;
    }
  }

  return bestScore > 0.2 ? best : null;
};