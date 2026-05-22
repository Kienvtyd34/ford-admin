export const matchIssue = (msg, issues) => {
  const text = enrichText(msg);

  let best = null;
  let bestScore = 0;

  for (const i of issues || []) {
    let score = 0;

    const title = normalize(i.title || "");

    // ⚠️ chỉ match STRONG TITLE
    if (text.includes(title)) score += 10;

    for (const s of i.symptoms || []) {
      if (text.includes(normalize(s))) score += 3;
    }

    // 🔥 CHẶN LỆCH DOMAIN
    if (text.includes("7 cho") || text.includes("suv")) {
      score -= 5;
    }

    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }

  return bestScore >= 6 ? { issue: best } : null;
};