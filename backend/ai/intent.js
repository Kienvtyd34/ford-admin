export const detectIntent = (text = "") => {
  const msg = text.toLowerCase();

  // ======================
  // PRICE
  // ======================
  if (/(giá|bao nhiêu|price|cost)/.test(msg)) return "price";

  // ======================
  // NEWS (STRICT)
  // ======================
  if (/(tin tức|mới nhất|news|khuyến mãi)/.test(msg)) return "news";

  // ======================
  // PROBLEM
  // ======================
  if (/(lỗi|hỏng|error|bị gì)/.test(msg)) return "problem";

  // ======================
  // RECOMMEND (SMART NLP)
  // ======================
  if (
    /(xe|tư vấn|chọn|mua)/.test(msg) ||
    /(7 chỗ|gia đình|suv|bán tải|pickup|sedan)/.test(msg)
  ) {
    return "recommend";
  }

  return "unknown";
};