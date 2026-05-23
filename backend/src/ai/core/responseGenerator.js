export const generateResponse = ({
  intent,
  data,
}) => {
  switch (intent) {
    case "PRICE_QUERY":
      return `🚗 ${data.model.name} có giá từ ${data.minPrice.toLocaleString("vi-VN")} VNĐ`;

    case "VEHICLE_SUGGESTION":
      return `✅ Tôi gợi ý bạn tham khảo ${data.name}`;

    case "INVENTORY_CHECK":
      return `📦 Hiện tại showroom còn ${data.length} xe trong kho`;

    case "TECH_SUPPORT":
      return `⚠️ ${data.title}\n\n🛠️ Giải pháp:\n${data.solutions.join("\n")}`;

    default:
      return "🤖 Tôi chưa hiểu yêu cầu của bạn";
  }
};