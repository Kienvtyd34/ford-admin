import { normalizeText } from "./brain/normalizeData.js";

export const problemEngine = async (
  message,
  results
) => {

  const text =
    normalizeText(message);

  const problems =
    results.filter(
      (r) => r.type === "problem"
    );

  if (!problems.length) {
    return null;
  }

  let best = null;
  let bestScore = 0;

  for (const p of problems) {

    let score = 0;

    const symptoms =
      p.payload.symptoms || [];

    const causes =
      p.payload.causes || [];

    for (const s of symptoms) {

      const symptom =
        normalizeText(s);

      if (
        text.includes(symptom)
      ) {
        score += 2;
      }
    }

    for (const c of causes) {

      const cause =
        normalizeText(c);

      if (
        text.includes(cause)
      ) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      best = p.payload;
    }
  }

  if (bestScore === 0) {
    return null;
  }

  return best;
};