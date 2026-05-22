export const matchIssue = (msg, issues) => {
  const text = enrichText(msg);

  let best = null;
  let bestScore = 0;

  for (const i of issues) {
    let score = 0;

    const title = normalize(i.title);
    const symptoms = (i.symptoms || []).map(normalize).join(" ");
    const causes = (i.causes || []).map(normalize).join(" ");

    // TITLE MATCH STRONG
    if (text.includes(title)) score += 10;

    // SYMPTOMS MATCH
    for (const s of i.symptoms || []) {
      if (text.includes(normalize(s))) score += 4;
    }

    // CAUSES MATCH
    for (const c of i.causes || []) {
      if (text.includes(normalize(c))) score += 3;
    }

    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }

  // 🔥 threshold ổn định production
  return bestScore >= 5 ? { issue: best } : null;
};