export const detectIntent = (text = "") => {
  const msg = text.toLowerCase();

  // PRICE
  if (/(giá|bao nhiêu|price|cost)/.test(msg)) return "price";

  // NEWS
  if (/(tin tức|mới nhất|news|khuyến mãi)/.test(msg)) return "news";

  // PROBLEM
  if (/(lỗi|hỏng|error|bị gì)/.test(msg)) return "problem";

  // RECOMMEND (semantic + NLP mạnh hơn)
  if (
    /(xe|tư vấn|chọn|mua|gia đình|7 chỗ|suv|bán tải|pickup|sedan)/.test(msg)
  ) {
    return "recommend";
  }

  return "unknown";
};