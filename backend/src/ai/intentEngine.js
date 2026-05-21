import { normalize } from "./normalize.js";

export const detectIntent = (message) => {
  const q = normalize(message);

  if (q.includes("gia"))
    return "PRICE_QUERY";

  if (
    q.includes("so sanh") ||
    q.includes("vs")
  )
    return "COMPARE";

  if (
    q.includes("lai thu") ||
    q.includes("demo")
  )
    return "DEMO";

  if (
    q.includes("loi") ||
    q.includes("abs") ||
    q.includes("giat so")
  )
    return "TECHNICAL";

  if (
    q.includes("tu van") ||
    q.includes("goi y")
  )
    return "RECOMMEND";

  return "GENERAL";
};