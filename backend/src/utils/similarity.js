import stringSimilarity from "string-similarity";

export const compare = (a, b) => {
  return stringSimilarity.compareTwoStrings(a, b);
};