export const buildVehicleResponse = (
  car,
  variant
) => {
  return `
🚗 ${car.name}

💰 Giá từ:
${variant?.basePrice?.toLocaleString("vi-VN")} VNĐ

🚘 Phiên bản:
${variant?.variantName}

⚙️ Hộp số:
${variant?.transmission}

🛞 Dẫn động:
${variant?.driveTrain}

⛽ Nhiên liệu:
${variant?.fuelType}

👥 Số chỗ:
${car.seats}

🔥 Dòng xe:
${car.type}
`;
};