export const generateResponse = ({
  intent,
  data,
}) => {
  switch (intent) {
    case "PRICE_QUERY":
      return `
🚗 ${data.model.name}

💰 Giá từ:
${data.minPrice.toLocaleString(
  "vi-VN"
)} VNĐ
`;

    case "VEHICLE_SUGGESTION":
      return data
        .map(
          (v) => `
🚗 ${v.name}
💰 ${v.basePrice?.toLocaleString(
            "vi-VN"
          )} VNĐ
`
        )
        .join("\n");

    case "COMPARE":

      // compare xe Ford nội bộ

      if (data.a && data.b) {
        return `
⚔️ So sánh ${data.a.name} và ${data.b.name}

💺 Số chỗ:
${data.a.seats} vs ${data.b.seats}

🚘 Loại xe:
${data.a.type} vs ${data.b.type}
`;
      }

      // compare ngoài Ford

      if (data.externalCompare) {
        return `
⚔️ ${data.externalCompare.title}

✅ ${data.externalCompare.content}
`;
      }

      return `
⚔️ So sánh ${data.a.name} và ${data.b.name}

💺 Số chỗ:
${data.a.seats} vs ${data.b.seats}

🚘 Loại xe:
${data.a.type} vs ${data.b.type}
`;

    case "INVENTORY_CHECK":
      return `
📦 Hiện còn ${data.length} xe trong kho.
`;

    case "VEHICLE_SPEC":
      return `
🚗 ${data.name}

⚙️ Động cơ:
${data.engine}

💺 Số chỗ:
${data.seats}

🛡️ Công nghệ:
${data.features?.join(", ")}
`;

    case "TECH_SUPPORT":
      return `
⚠️ ${data.title}

🛠️ Giải pháp:
${data.solutions.join("\n")}
`;

    default:
      return "🤖 Tôi chưa hiểu yêu cầu.";
  }
};

export default generateResponse;
