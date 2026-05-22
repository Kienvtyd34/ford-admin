import { enrichText, normalize } from "./textEngine.js";

export const matchIssue = (msg, issues) => {
  const text = enrichText(msg);

  let best = null;
  let bestScore = 0;

  for (const i of issues) {
    let score = 0;

    const title = normalize(i.title);

    if (text.includes(title)) score += 5;

    for (const s of i.symptoms || []) {
      if (text.includes(normalize(s))) score += 3;
    }

    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }

  return bestScore >= 3 ? { issue: best } : null;
};