export const detectIntent = (text = "") => {
  const msg = text.toLowerCase();

  // =======================
  // PRICE
  // =======================
  if (
    msg.includes("giá") ||
    msg.includes("bao nhiêu") ||
    msg.includes("price")
  ) {
    return "price";
  }

  // =======================
  // NEWS
  // =======================
  if (
    msg.includes("tin tức") ||
    msg.includes("mới nhất") ||
    msg.includes("news")
  ) {
    return "news";
  }

  // =======================
  // PROBLEM
  // =======================
  if (
    msg.includes("lỗi") ||
    msg.includes("hỏng") ||
    msg.includes("bị gì")
  ) {
    return "problem";
  }

  // =======================
  // RECOMMEND (SMART UPGRADE)
  // =======================
  if (
    msg.includes("xe") ||
    msg.includes("tư vấn") ||
    msg.includes("chọn xe") ||
    msg.includes("7 chỗ") ||
    msg.includes("gia đình") ||
    msg.includes("bán tải") ||
    msg.includes("mạnh nhất") ||
    msg.includes("suv")
  ) {
    return "recommend";
  }

  return "unknown";
};