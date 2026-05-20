export const selfHealIntent = (message, scores) => {
  const text = message.toLowerCase();

  const top = scores?.[0];

  // 🔥 OVERRIDE FAIL CASES
  if (
    text.includes("xe nào phù hợp") ||
    text.includes("nên mua xe") ||
    text.includes("tư vấn xe") ||
    text.includes("xe 7 chỗ")
  ) {
    return [
      { intent: "recommend", score: 0.99 },
    ];
  }

  // 🔥 FALLBACK RECOVERY
  if (!top || top.score < 0.2) {
    return [
      { intent: "recommend", score: 0.6 },
      { intent: "price", score: 0.4 },
    ];
  }

  return scores;
};