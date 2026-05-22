export const matchIssue = (msg, issues) => {
  const text = enrichText(msg);

  let best = null;
  let bestScore = 0;

  for (const i of issues) {
    let score = 0;

    const title = normalize(i.title);

    if (text.includes(title)) score += 10;

    for (const s of i.symptoms || []) {
      if (text.includes(normalize(s))) score += 5;
    }

    for (const c of i.causes || []) {
      if (text.includes(normalize(c))) score += 4;
    }

    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }

  return bestScore >= 5 ? { issue: best } : null;
};