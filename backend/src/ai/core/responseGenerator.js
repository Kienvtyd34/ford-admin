export const generateResponse = ({ intent, data }) => {
  switch (intent) {

    // =====================================
    // PRICE
    // =====================================
    case "PRICE_QUERY": {
      if (!data) return "❌ Không có dữ liệu giá xe.";

      return `
🚗 ${data.model?.name || "Không rõ mẫu xe"}

📌 Phiên bản:
${data.selectedVariant?.variantName || "-"}

💰 Giá niêm yết:
${data.basePrice?.toLocaleString("vi-VN") || "-"} VNĐ

🚘 Giá lăn bánh tạm tính:
${data.onRoadPrice?.toLocaleString("vi-VN") || "-"} VNĐ
      `;
    }

    // =====================================
    // VEHICLE SUGGESTION
    // =====================================
    case "VEHICLE_SUGGESTION": {
      if (!Array.isArray(data)) return "❌ Không có dữ liệu gợi ý.";

      return data
        .slice(0, 5)
        .map((v) => `
🚗 ${v.modelId?.name || "Ford"}

📌 ${v.variantName || "-"}

💰 Giá từ:
${v.basePrice?.toLocaleString("vi-VN") || "-"} VNĐ
        `)
        .join("\n");
    }

    // =====================================
    // VEHICLE SPEC
    // =====================================
    case "VEHICLE_SPEC": {
      if (!data) return "❌ Không có thông số xe.";

      const specs = data.specs || {};
      const features = data.features || {};

      const featureList = [];

      if (features.adas) featureList.push("ADAS");
      if (features.camera360) featureList.push("Camera 360");
      if (features.sunroof) featureList.push("Cửa sổ trời");
      if (features.wirelessCharging) featureList.push("Sạc không dây");
      if (features.ventilatedSeat) featureList.push("Ghế làm mát");
      if (features.blindSpot) featureList.push("Cảnh báo điểm mù");

      return `
🚗 ${data.variantName || "-"}

⚙️ Động cơ:
${specs.engine || "Đang cập nhật"}

🐎 Công suất:
${specs.horsepower || "-"} HP

🔩 Mô-men xoắn:
${specs.torque || "-"} Nm

⚙️ Hộp số:
${data.transmission || "-"}

🚘 Dẫn động:
${data.driveTrain || "-"}

⛽ Nhiên liệu:
${data.fuelType || "-"}

💺 Số chỗ:
${specs.seats || "-"}

🛞 Mâm xe:
${specs.wheelSize || "-"} inch

⛽ Bình xăng:
${specs.fuelTank || "-"} L

📏 Khoảng sáng gầm:
${specs.groundClearance || "-"} mm

📐 Chiều dài cơ sở:
${specs.wheelbase || "-"} mm

🛡️ Trang bị nổi bật:
${featureList.length ? featureList.join(", ") : "Đang cập nhật"}
      `;
    }

    // =====================================
    // FEATURE QUERY
    // =====================================
    case "FEATURE_QUERY": {
      if (!data) return "❌ Không có dữ liệu tính năng.";

      const label = data.feature || "tính năng";

      return data.available
        ? `✅ ${data.variantName} có trang bị ${label}.`
        : `❌ ${data.variantName} không có trang bị ${label}.`;
    }

    // =====================================
    // MODEL COMPARE
    // =====================================
    case "COMPARE": {
      if (!data?.a || !data?.b) return "❌ Không đủ dữ liệu so sánh.";

      return `
⚔️ So sánh

🚗 ${data.a.model?.name || "-"}
VS
🚗 ${data.b.model?.name || "-"}

💺 Số chỗ:
${data.a.variant?.specs?.seats || "-"} vs ${data.b.variant?.specs?.seats || "-"}

🚘 Loại xe:
${data.a.model?.type || "-"} vs ${data.b.model?.type || "-"}

💰 Giá:
${data.a.variant?.basePrice?.toLocaleString("vi-VN") || "-"} vs ${data.b.variant?.basePrice?.toLocaleString("vi-VN") || "-"}
      `;
    }

    // =====================================
    // VARIANT COMPARE
    // =====================================
    case "VARIANT_COMPARE": {
      if (!data?.a || !data?.b) return "❌ Không có dữ liệu so sánh phiên bản.";

      return `
⚔️ So sánh phiên bản

🚗 ${data.a.variantName}
VS
🚗 ${data.b.variantName}

💰 Giá:
${data.a.basePrice?.toLocaleString("vi-VN") || "-"} VNĐ
VS
${data.b.basePrice?.toLocaleString("vi-VN") || "-"} VNĐ

🐎 Công suất:
${data.a.specs?.horsepower || "-"} HP
VS
${data.b.specs?.horsepower || "-"} HP

🔩 Mô-men xoắn:
${data.a.specs?.torque || "-"} Nm
VS
${data.b.specs?.torque || "-"} Nm

📷 Camera 360:
${data.a.features?.camera360 ? "Có" : "Không"}
VS
${data.b.features?.camera360 ? "Có" : "Không"}

☀️ Cửa sổ trời:
${data.a.features?.sunroof ? "Có" : "Không"}
VS
${data.b.features?.sunroof ? "Có" : "Không"}

🔋 Sạc không dây:
${data.a.features?.wirelessCharging ? "Có" : "Không"}
VS
${data.b.features?.wirelessCharging ? "Có" : "Không"}

🛡️ ADAS:
${data.a.features?.adas ? "Có" : "Không"}
VS
${data.b.features?.adas ? "Có" : "Không"}
      `;
    }

    // =====================================
    // INVENTORY
    // =====================================
    case "INVENTORY_CHECK": {
      if (!Array.isArray(data) || data.length === 0) {
        return "📦 Hiện chưa có xe phù hợp trong kho.";
      }

      const cars = data
        .slice(0, 5)
        .map(
          (item) =>
            `• ${item.variantId?.modelId?.name || "-"} - ${item.variantId?.variantName || "-"}`
        )
        .join("\n");

      return `
📦 Hiện có ${data.length} xe trong kho

${cars}
      `;
    }

    // =====================================
    // TECH SUPPORT
    // =====================================
    case "TECH_SUPPORT": {
      if (!data) return "⚠️ Không tìm thấy lỗi phù hợp.";

      return `
⚠️ ${data.title || "-"}

🛠️ Nguyên nhân:
${data.causes?.join("\n") || "-"}

✅ Giải pháp:
${data.solutions?.join("\n") || "-"}
      `;
    }

    // =====================================
    // DEFAULT
    // =====================================
    default:
      return "🤖 Tôi chưa hiểu yêu cầu.";
  }
};

export default generateResponse;