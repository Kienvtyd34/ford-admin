// ai/technicalRag.js

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

  const ranked = issues.map((i) => {
    const title = normalize(i.title);
    const symptoms = (i.symptoms || []).join(" ");

    return {
      issue: i,
      score:
        similarity(text, title) * 5 +
        similarity(text, symptoms) * 3,
    };
  });

  ranked.sort((a, b) => b.score - a.score);

  const best = ranked[0];

  if (!best || best.score < 0.5) return null;

  return {
    issue: best.issue,
    confidence: Math.min(best.score / 5, 1),
  };
};