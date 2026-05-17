import fuzz from "fuzzball";

import removeAccents
from "remove-accents";

const normalizeText = (text) => {

  return removeAccents(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const calculateScore = (
  symptoms,
  text
) => {

  const normalizedText =
    normalizeText(text);

  let bestScore = 0;

  for (const symptom of symptoms) {

    const normalizedSymptom =
      normalizeText(symptom);

    const score =
      fuzz.token_set_ratio(
        normalizedSymptom,
        normalizedText
      );

    if (score > bestScore) {
      bestScore = score;
    }
  }

  return bestScore;
};