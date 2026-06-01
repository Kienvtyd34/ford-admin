import { vectorSearch } from "./vectorSearch.js";

export const ragEngine = async (query) => {
  const docs = await vectorSearch(query);

  if (!docs.length) return null;

  return {
    answer: `
🔎 Kết quả tìm kiếm:

${docs.map(d => `• ${d.text}`).join("\n")}
    `,
    sources: docs,
  };
};

export default ragEngine;