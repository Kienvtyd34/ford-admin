export const classifyIntent = (text = "") => {
  text = text.toLowerCase();

  if (text.includes("giá")) return "price";
  if (text.includes("so sánh")) return "compare";
  if (text.includes("trả góp")) return "installment";
  if (text.includes("lái thử")) return "test_drive";

  return "fallback";
};