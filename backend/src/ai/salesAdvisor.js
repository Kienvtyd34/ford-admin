export const salesAdvisor = (
  entities
) => {
  if (
    entities.usage === "family"
  ) {
    return `
👉 Tôi khuyên bạn nên chọn Ford Everest vì:
- rộng rãi
- 7 chỗ
- đi gia đình tốt
- an toàn cao
`;
  }

  if (
    entities.usage === "offroad"
  ) {
    return `
👉 Ranger Raptor phù hợp:
- offroad mạnh
- gầm cao
- địa hình tốt
`;
  }

  return "";
};