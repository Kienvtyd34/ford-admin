// src/ai/responseBuilder.js

// ================= VEHICLE =================

export const buildVehicleResponse = (
  car,
  variant
) => {

  if (!car) {
    return `
Không tìm thấy xe
`;
  }

  return `
🚗 ${car.name}

💰 Giá từ:
${variant?.basePrice?.toLocaleString(
  "vi-VN"
) || "Liên hệ"} VNĐ

🚘 Phiên bản:
${variant?.variantName || "Đang cập nhật"}

⚙️ Hộp số:
${variant?.transmission || "Đang cập nhật"}

🛞 Dẫn động:
${variant?.driveTrain || "Đang cập nhật"}

⛽ Nhiên liệu:
${variant?.fuelType || "Đang cập nhật"}

👥 Số chỗ:
${car.seats}

🔥 Dòng xe:
${car.type}
`;
};

// ================= COMPARE =================

export const buildCompareResponse = (
  car1,
  car2,
  variant1,
  variant2
) => {

  return `
⚔️ So sánh ${car1.name} vs ${car2.name}

======================

🚗 ${car1.name}

💰 Giá:
${variant1?.basePrice?.toLocaleString(
  "vi-VN"
) || "?"} VNĐ

👥 Số chỗ:
${car1.seats}

🔥 Loại xe:
${car1.type}

🛞 Dẫn động:
${variant1?.driveTrain || "?"}

======================

🚗 ${car2.name}

💰 Giá:
${variant2?.basePrice?.toLocaleString(
  "vi-VN"
) || "?"} VNĐ

👥 Số chỗ:
${car2.seats}

🔥 Loại xe:
${car2.type}

🛞 Dẫn động:
${variant2?.driveTrain || "?"}

======================

📌 Gợi ý:

${
  car1.type === "SUV" &&
  car1.seats >= 7
    ? `• ${car1.name} phù hợp gia đình`
    : ""
}

${
  car2.type === "Pick-up"
    ? `• ${car2.name} phù hợp offroad`
    : ""
}
`;
};

// ================= INVENTORY =================

export const buildInventoryResponse = (
  item
) => {

  return `
🚗 ${item.vehicleName}

🎯 Có sẵn lái thử

📍 Showroom:
${item.location || "Đang cập nhật"}

🎨 Màu:
${item.color || "Đang cập nhật"}
`;
};

// ================= TECHNICAL =================

export const buildTechnicalResponse = (
  problem
) => {

  return `
⚠️ ${problem.title}

🚨 Mức độ:
${problem.severity}

🔍 Triệu chứng:
${problem.symptoms.join(", ")}

🛠️ Nguyên nhân:
${problem.causes.join(", ")}

✅ Giải pháp:
${problem.solutions.join(", ")}

🚗 Xe liên quan:
${problem.relatedVehicles.join(", ")}
`;
};