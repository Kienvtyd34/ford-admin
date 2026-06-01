import { vectorSearch } from "./vectorSearch.js";

export const ragEngine = async (query) => {
  try {
    const docs = await vectorSearch(query).catch(() => []);

    if (!docs || docs.length === 0) {
      return {
        answer: "🤖 Không tìm thấy dữ liệu liên quan.",
        sources: [],
      };
    }

    return {
      answer: `🔎 Kết quả:\n${docs.map(d => "• " + d.text).join("\n")}`,
      sources: docs,
    };

  } catch (e) {
    return {
      answer: "🤖 RAG tạm thời không khả dụng",
      sources: [],
    };
  }
};