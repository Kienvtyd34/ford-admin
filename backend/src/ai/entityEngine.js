import { enrichText, normalize } from "./textEngine.js";

const similarity = (a, b) => {
  const A = new Set(a.split(" "));
  const B = new Set(b.split(" "));
  let hit = 0;
  A.forEach((w) => B.has(w) && hit++);
  return hit / Math.max(A.size, 1);
};

export const matchIssue = (msg, issues) => {
  const text = enrichText(msg);

  let best = null;
  let bestScore = 0;

  for (const i of issues) {
    let score = 0;

    const title = normalize(i.title);
    const symptoms = (i.symptoms || []).map(normalize).join(" ");
    const causes = (i.causes || []).map(normalize).join(" ");

    // 🔥 TITLE MATCH STRONG
    if (text.includes(title)) score += 10;

    // 🔥 SYMPTOM MATCH
    score += similarity(text, symptoms) * 6;

    // 🔥 CAUSE MATCH
    score += similarity(text, causes) * 4;

    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }

  return bestScore >= 2 ? { issue: best } : null;
};