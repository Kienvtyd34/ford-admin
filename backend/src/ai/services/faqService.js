import faqData from "../data/faqData.js";
import { normalize } from "../../../src/utils/normalize.js";

export const faqService = (
  message
) => {
  const text = normalize(message);

  for (const item of faqData) {
    const matched = item.keywords.some(
      (keyword) =>
        text.includes(keyword)
    );

    if (matched) {
      return item.answer;
    }
  }

  return null;
};
