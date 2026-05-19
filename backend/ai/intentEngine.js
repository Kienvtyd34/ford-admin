export const detectIntent = (text) => {
  text = text.toLowerCase();

  if (text.includes("giá") || text.includes("bao nhiêu")) return "price";
  if (text.includes("suv") || text.includes("7 chỗ")) return "recommend";
  if (text.includes("còn hàng") || text.includes("tồn kho")) return "inventory";
  if (text.includes("lái thử")) return "testdrive";
  if (text.includes("lỗi")) return "problem";

  return "unknown";
};