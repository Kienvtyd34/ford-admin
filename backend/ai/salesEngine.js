import { brainIndex, brainMap } from "./brainStore.js";

export const salesAgent = async (query, intent) => {
  const result = brainIndex.search(queryVector(query), 5);

  const hits = result.labels
    .map((i) => brainMap[i])
    .filter(Boolean);

  // 🧠 logic sales agent
  const vehicles = hits.filter(h => h.type === "vehicle");

  if (vehicles.length === 0) {
    return "Bạn muốn xe 5 hay 7 chỗ? ngân sách bao nhiêu?";
  }

  const top = vehicles[0].payload;

  return `
🚗 Gợi ý xe phù hợp:
• ${top.name}
• ${top.type} - ${top.seats} chỗ
• Ford chính hãng

👉 Bạn muốn:
- báo giá?
- trả góp?
- lái thử?
`;
};

const queryVector = (text) => {
  // placeholder - dùng embedText thật ở router
  return new Float32Array(384).fill(0.01);
};