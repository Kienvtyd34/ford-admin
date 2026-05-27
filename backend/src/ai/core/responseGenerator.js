export const generateResponse = ({
  intent,
  data,
}) => {

  switch (intent) {

    case "PRICE_QUERY": {

      return `
🚗 ${data.model.name}

📌 Phiên bản:
${data.selectedVariant.variantName}

💰 Giá niêm yết:
${data.basePrice.toLocaleString("vi-VN")} VNĐ

🚘 Giá lăn bánh tạm tính:
${data.onRoadPrice.toLocaleString("vi-VN")} VNĐ
`;
    }

    // =========================

    case "VEHICLE_SUGGESTION": {

      return data
        .map((v) => {
          return `
🚗 ${v.name}

✅ ${v.reason}

💰 Giá khởi điểm:
${v.basePrice.toLocaleString("vi-VN")} VNĐ
`;
        })
        .join("\n");
    }

    // =========================

    case "COMPARE": {

      return `
⚔️ So sánh ${data.a.name} và ${data.b.name}

💺 Số chỗ:
${data.a.seats} vs ${data.b.seats}

🚘 Loại xe:
${data.a.type} vs ${data.b.type}
`;
    }

    // =========================

    case "INVENTORY_CHECK": {

      return `
📦 Hiện còn ${data.length} xe trong kho.
`;
    }

    // =========================

    case "VEHICLE_SPEC": {

      return `
🚗 ${data.name}

⚙️ Động cơ:
${data.engine}

⛽ Nhiên liệu:
${data.fuelType}

💺 Số chỗ:
${data.seats}

🛡️ Công nghệ:
${data.features.join(", ")}
`;
    }

    // =========================

    case "TECH_SUPPORT": {

      return `
⚠️ ${data.title}

🛠️ Giải pháp:
${data.solutions.join("\n")}
`;
    }

    default:

      return `🤖 Tôi chưa hiểu yêu cầu.`;
  }
};

export default generateResponse;
