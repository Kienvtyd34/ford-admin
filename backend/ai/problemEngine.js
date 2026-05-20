import { normalizeText } from "./brain/normalizeData.js";

export const problemEngine = async (
  message,
  results
) => {

  const text =
    normalizeText(message);

  // ================= PROBLEMS =================

  const problems =
    results.filter(
      (r) =>
        r.type === "problem"
    );

  console.log(
    "🔧 PROBLEMS:",
    problems.length
  );

  // ================= SCORE MATCH =================

  let best = null;
  let bestScore = 0;

  for (const p of problems) {

    let score = 0;

    // symptoms

    for (const symptom of (
      p.payload.symptoms || []
    )) {

      const s =
        normalizeText(symptom);

      // exact

      if (text.includes(s)) {
        score += 3;
      }

      // partial words

      const words =
        s.split(" ");

      for (const w of words) {

        if (
          w.length > 2 &&
          text.includes(w)
        ) {
          score += 1;
        }
      }
    }

    // title

    const title =
      normalizeText(
        p.payload.title || ""
      );

    if (
      title &&
      text.includes(title)
    ) {
      score += 5;
    }

    console.log(
      "🧠",
      p.payload.title,
      score
    );

    if (score > bestScore) {
      bestScore = score;
      best = p.payload;
    }
  }

  // ================= RESULT =================

  if (
    best &&
    bestScore >= 2
  ) {

    console.log(
      "✅ PROBLEM FOUND:",
      best.title
    );

    return best;
  }

  console.log(
    "❌ NO PROBLEM MATCH"
  );

  return null;
};