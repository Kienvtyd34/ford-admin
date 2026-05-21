// src/ai/salesAdvisor.js

export const salesAdvisor = (
  entities
) => {

  if (
    entities.seats === 7
  ) {
    return `
📌 Gợi ý:
Dòng SUV 7 chỗ phù hợp gia đình và đi xa.
`;
  }

  if (
    entities.offroad
  ) {
    return `
📌 Gợi ý:
Xe bán tải phù hợp offroad và chở hàng.
`;
  }

  return `
📌 Bạn có thể yêu cầu:
- so sánh xe
- xe gia đình
- xe tiết kiệm nhiên liệu
`;
};