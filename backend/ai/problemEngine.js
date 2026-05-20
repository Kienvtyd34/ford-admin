import { normalizeText } from "./brain/normalizeData.js";

export const problemEngine = async (
  message,
  results
) => {
  const text = normalizeText(message);

  const problems = results.filter(
    (r) => r.type === "problem"
  );

  const matched = problems.find((p) => {
    return p.payload.symptoms.some((s) =>
      text.includes(normalizeText(s))
    );
  });

  if (!matched) {
    return null;
  }

  return matched.payload;
};