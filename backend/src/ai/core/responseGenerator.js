export const generateResponse = ({
  intent,
  data,
}) => {

  switch (intent) {

    // =====================================
    // PRICE
    // =====================================

    case "PRICE_QUERY": {

      // variant

      if (
        data.selectedVariant
      ) {

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

      // fallback

      return `
🚗 ${data.model.name}

💰 Giá từ:
${data.minPrice.toLocaleString("vi-VN")} VNĐ
`;
    }

    // =====================================
    // SUGGESTION
    // =====================================

    case "VEHICLE_SUGGESTION": {

  return data
    .map((v) => {

      return `
🚗 ${v.name}

✅ ${v.reason || "Phù hợp nhu cầu sử dụng"}

💰 Giá khởi điểm:
${v.basePrice?.toLocaleString(
  "vi-VN"
)} VNĐ
`;

    })
    .join("\n");
}

    // =====================================
    // COMPARE
    // =====================================

    case "COMPARE": {

      return `
⚔️ So sánh ${data.a.name} và ${data.b.name}

💺 Số chỗ:
${data.a.seats} vs ${data.b.seats}

🚘 Loại xe:
${data.a.type} vs ${data.b.type}
`;
    }

    // =====================================
    // INVENTORY
    // =====================================

    case "INVENTORY_CHECK": {

      return `
📦 Hiện còn ${data.length} xe trong kho.
`;
    }

    // =====================================
    // SPECS
    // =====================================

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

    // =====================================
    // TECH SUPPORT
    // =====================================

    case "TECH_SUPPORT": {

      return `
⚠️ ${data.title}

🛠️ Giải pháp:
${data.solutions.join("\n")}
`;
    }

    default:

      return `
🤖 Tôi chưa hiểu yêu cầu.
`;
  }
};

export default generateResponse;