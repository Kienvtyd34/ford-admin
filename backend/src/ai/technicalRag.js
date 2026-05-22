import { enrichText } from "./textEngine.js";

export const matchIssue = (msg, issues) => {
  const text = enrichText(msg);

  let best = null;
  let bestScore = 0;

  for (const i of issues) {
    let score = 0;

    if (text.includes((i.title || "").toLowerCase())) score += 5;

    for (const s of i.symptoms || []) {
      if (text.includes(s.toLowerCase())) score += 3;
    }

    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }

  if (bestScore < 3) return null;

  return { issue: best };
};